/**
 * useIframeActivityForwarding turns activity inside an iframe into the
 * 'activity-update' messages the session provider listens for, so working in a
 * workspace frame is not mistaken for inactivity.
 */
import { renderHook } from '@testing-library/react';
import { ACTIVITY_CHANNEL } from '../constants';
import {
  IFRAME_ACTIVITY_THROTTLE_MILLISECONDS,
  useIframeActivityForwarding,
} from '../useIframeActivity';

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];
  closed = false;
  postMessage = jest.fn();
  constructor(public name: string) {
    MockBroadcastChannel.instances.push(this);
  }
  close() {
    this.closed = true;
  }
}

const makeIframe = (): HTMLIFrameElement => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return iframe;
};

const fire = (doc: Document, type: string) =>
  doc.dispatchEvent(new Event(type, { bubbles: false }));

describe('useIframeActivityForwarding', () => {
  const realBroadcastChannel = (globalThis as Record<string, unknown>)
    .BroadcastChannel;
  let now: number;

  beforeEach(() => {
    MockBroadcastChannel.instances = [];
    (globalThis as Record<string, unknown>).BroadcastChannel =
      MockBroadcastChannel;
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (globalThis as Record<string, unknown>).BroadcastChannel =
      realBroadcastChannel;
    document.body.innerHTML = '';
  });

  const setup = () => {
    const { result, unmount } = renderHook(() => useIframeActivityForwarding());
    const channel = MockBroadcastChannel.instances[0];
    return { attach: result.current, unmount, channel };
  };

  it('posts on the session activity channel', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    attach(iframe);

    fire(iframe.contentDocument as Document, 'mousedown');

    expect(channel.name).toBe(ACTIVITY_CHANNEL);
    expect(channel.postMessage).toHaveBeenCalledWith({
      type: 'activity-update',
      timestamp: now,
    });
  });

  it.each(['mousedown', 'keydown', 'touchstart', 'scroll'])(
    'counts %s as activity',
    (type) => {
      const { attach, channel } = setup();
      const iframe = makeIframe();
      attach(iframe);

      fire(iframe.contentDocument as Document, type);

      expect(channel.postMessage).toHaveBeenCalledTimes(1);
    },
  );

  it('does not count keypress, which never fires for arrows or backspace', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    attach(iframe);

    fire(iframe.contentDocument as Document, 'keypress');

    expect(channel.postMessage).not.toHaveBeenCalled();
  });

  it('sees events whose propagation the frame stops', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    const doc = iframe.contentDocument as Document;
    const target = doc.createElement('div');
    doc.body.appendChild(target);
    // the app swallows the key in capture, as JupyterLab does for shortcuts
    doc.body.addEventListener('keydown', (e) => e.stopPropagation(), true);
    attach(iframe);

    target.dispatchEvent(new Event('keydown', { bubbles: true }));

    expect(channel.postMessage).toHaveBeenCalledTimes(1);
  });

  it('throttles bursts and resumes after the window', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    const doc = iframe.contentDocument as Document;
    attach(iframe);

    fire(doc, 'scroll');
    fire(doc, 'scroll');
    now += IFRAME_ACTIVITY_THROTTLE_MILLISECONDS - 1;
    fire(doc, 'scroll');
    expect(channel.postMessage).toHaveBeenCalledTimes(1);

    now += 1;
    fire(doc, 'scroll');
    expect(channel.postMessage).toHaveBeenCalledTimes(2);
  });

  it('moves to the new document when the frame loads again', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    const firstDoc = iframe.contentDocument as Document;
    attach(iframe);

    // a reload or navigation inside the frame gives it a new document
    const secondDoc = document.implementation.createHTMLDocument('next');
    Object.defineProperty(iframe, 'contentDocument', {
      value: secondDoc,
      configurable: true,
    });
    attach(iframe);

    fire(firstDoc, 'mousedown');
    expect(channel.postMessage).not.toHaveBeenCalled();

    fire(secondDoc, 'mousedown');
    expect(channel.postMessage).toHaveBeenCalledTimes(1);
  });

  it('falls back to window focus/blur when the document is unreachable', () => {
    const { attach, channel } = setup();
    const iframe = makeIframe();
    Object.defineProperty(iframe, 'contentDocument', {
      get() {
        throw new DOMException('cross-origin', 'SecurityError');
      },
      configurable: true,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      get() {
        throw new DOMException('cross-origin', 'SecurityError');
      },
      configurable: true,
    });
    attach(iframe);

    window.dispatchEvent(new Event('blur'));

    expect(channel.postMessage).toHaveBeenCalledTimes(1);
  });

  it('stops forwarding and closes the channel on unmount', () => {
    const { attach, unmount, channel } = setup();
    const iframe = makeIframe();
    const doc = iframe.contentDocument as Document;
    attach(iframe);

    unmount();
    fire(doc, 'mousedown');

    expect(channel.closed).toBe(true);
    expect(channel.postMessage).not.toHaveBeenCalled();
  });

  it('removes the window fallback listeners on unmount', () => {
    const { attach, unmount, channel } = setup();
    const iframe = makeIframe();
    Object.defineProperty(iframe, 'contentDocument', {
      value: null,
      configurable: true,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      value: null,
      configurable: true,
    });
    attach(iframe);

    unmount();
    window.dispatchEvent(new Event('focus'));

    expect(channel.postMessage).not.toHaveBeenCalled();
  });

  it('does nothing, and does not throw, without BroadcastChannel', () => {
    delete (globalThis as Record<string, unknown>).BroadcastChannel;
    const { result } = renderHook(() => useIframeActivityForwarding());
    const iframe = makeIframe();

    expect(() => result.current(iframe)).not.toThrow();
    expect(() =>
      fire(iframe.contentDocument as Document, 'mousedown'),
    ).not.toThrow();
  });

  it('ignores a null iframe', () => {
    const { attach, channel } = setup();

    expect(() => attach(null)).not.toThrow();
    window.dispatchEvent(new Event('focus'));

    expect(channel.postMessage).not.toHaveBeenCalled();
  });
});
