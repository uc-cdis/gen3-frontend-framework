import { withBasePath } from '../strings';

describe('withBasePath', () => {
  it('should return the source if it is an absolute URL (starting with http://)', () => {
    const result = withBasePath('/base', 'http://example.com/image.png');
    expect(result).toBe('http://example.com/image.png');
  });

  it('should return the source if it is an absolute URL (starting with https://)', () => {
    const result = withBasePath('/base', 'https://example.com/image.png');
    expect(result).toBe('https://example.com/image.png');
  });

  it('should prepend the basePath to the source if it is a relative path', () => {
    const result = withBasePath('/base', 'image.png');
    expect(result).toBe('/base/image.png');
  });

  it('should normalize slashes in the resulting path', () => {
    const result = withBasePath('/base/', '/image.png');
    expect(result).toBe('/base/image.png');
  });

  it('should handle empty basePath and return src', () => {
    const result = withBasePath('', '/src');
    expect(result).toBe('/src');
  });

  it('should handle basePath without a trailing slash and prepend correctly', () => {
    const result = withBasePath('/base', 'folder/image.png');
    expect(result).toBe('/base/folder/image.png');
  });

  it('should not modify source if basePath is empty and source is relative', () => {
    const result = withBasePath('', 'image.png');
    expect(result).toBe('/image.png');
  });

  it('should not modify source if both basePath and src are empty', () => {
    const result = withBasePath('', '');
    expect(result).toBe('');
  });
  it('should return /ff if base path is /ff and src is empty', () => {
    const result = withBasePath('/ff', '');
    expect(result).toBe('/ff');
  });
  it('should return empty if base path and src are empty', () => {
    const result = withBasePath('/ff', '');
    expect(result).toBe('/ff');
  });
});
