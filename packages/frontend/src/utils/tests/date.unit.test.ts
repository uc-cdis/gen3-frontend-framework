import { getFormattedTimestamp } from '../date';

describe('getFormattedTimestamp', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupMockDate = (dateString: string): void => {
    const mockDate = new Date(dateString);
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate as unknown as Date);
  };

  const setupMockIntl = (): void => {
    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: 'America/Chicago' }),
        }) as any,
    );
  };

  const mockDateAndTest = (
    dateString: string,
    expectedWithoutTime: string,
    expectedWithTime: string,
    description: string,
  ): void => {
    test(description, () => {
      setupMockDate(dateString);
      setupMockIntl();

      const resultWithoutTime = getFormattedTimestamp();
      expect(resultWithoutTime).toBe(expectedWithoutTime);

      const resultWithTime = getFormattedTimestamp({ includeTimes: true });
      expect(resultWithTime).toBe(expectedWithTime);
    });
  };

  const DATE_FORMATS = {
    REGULAR: '2024-10-08T16:14:11-05:00',
    SINGLE_DIGIT: '2024-09-08T04:05:06-05:00',
    END_YEAR_CST: '2024-12-31T23:59:59-06:00',
  };

  const TEST_MESSAGES = {
    REGULAR_DATETIME: 'formats regular datetime correctly',
    SINGLE_DIGIT: 'handles single-digit hours/minutes/seconds',
    END_YEAR_CST: 'handles end of year in CST',
  };

  function runMockDateAndTest(
    dateString: string,
    expectedDate: string,
    expectedTime: string,
    message: string,
  ) {
    mockDateAndTest(dateString, expectedDate, expectedTime, message);
  }

  runMockDateAndTest(
    DATE_FORMATS.REGULAR,
    '2024-10-08',
    '2024-10-08.161411',
    TEST_MESSAGES.REGULAR_DATETIME,
  );
  runMockDateAndTest(
    DATE_FORMATS.SINGLE_DIGIT,
    '2024-09-08',
    '2024-09-08.040506',
    TEST_MESSAGES.SINGLE_DIGIT,
  );
  runMockDateAndTest(
    DATE_FORMATS.END_YEAR_CST,
    '2024-12-31',
    '2024-12-31.235959',
    TEST_MESSAGES.END_YEAR_CST,
  );

  test('verifies format pattern', () => {
    const mockDate = new Date('2024-01-01T12:00:00-06:00');
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate as unknown as Date);
    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: 'America/Chicago' }),
        }) as any,
    );

    const resultWithoutTime = getFormattedTimestamp();
    expect(resultWithoutTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const resultWithTime = getFormattedTimestamp({ includeTimes: true });
    expect(resultWithTime).toMatch(/^\d{4}-\d{2}-\d{2}\.\d{6}$/);
  });

  test('handles null date', () => {
    const result = getFormattedTimestamp({ date: null });
    expect(result).toBeUndefined();
  });

  test('handles explicit date input', () => {
    const inputDate = new Date('2023-05-15T10:30:45');
    const result = getFormattedTimestamp({ date: inputDate });
    expect(result).toBe('2023-05-15');
  });

  test('handles different time zones', () => {
    jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(
        () => ({ resolvedOptions: () => ({ timeZone: 'UTC' }) }) as any,
      );

    const utcDate = new Date('2024-01-01T00:00:00Z');
    const utcResult = getFormattedTimestamp({
      date: utcDate,
      includeTimes: true,
    });
    expect(utcResult).toBe('2024-01-01.000000');

    jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(
        () => ({ resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }) }) as any,
      );

    const tokyoResult = getFormattedTimestamp({
      date: utcDate,
      includeTimes: true,
    });
    expect(tokyoResult).toBe('2024-01-01.090000'); // 9 hours ahead of UTC
  });
});
