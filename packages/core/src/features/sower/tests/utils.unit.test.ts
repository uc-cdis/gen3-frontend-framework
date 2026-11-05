import {
  isCreateAndExportOutputConfig,
  isJobActionFunctionConfig,
} from '../utils';

describe('Sower utils type guards', () => {
  describe('isJobActionFunctionConfig', () => {
    it('should return true for valid JobActionFunctionConfig with parameters', () => {
      const validConfig = {
        name: 'test-action',
        parameters: { key: 'value' },
      };
      expect(isJobActionFunctionConfig(validConfig)).toBe(true);
    });

    it('should return true for valid JobActionFunctionConfig without parameters', () => {
      const validConfig = {
        name: 'test-action',
      };
      expect(isJobActionFunctionConfig(validConfig)).toBe(true);
    });

    it('should return true for valid JobActionFunctionConfig with undefined parameters', () => {
      const validConfig = {
        name: 'test-action',
        parameters: undefined,
      };
      expect(isJobActionFunctionConfig(validConfig)).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(isJobActionFunctionConfig(null)).toBe(false);
      expect(isJobActionFunctionConfig(undefined)).toBe(false);
      expect(isJobActionFunctionConfig('string')).toBe(false);
      expect(isJobActionFunctionConfig(123)).toBe(false);
      expect(isJobActionFunctionConfig({})).toBe(false);
      expect(isJobActionFunctionConfig({ parameters: {} })).toBe(false);
      expect(isJobActionFunctionConfig({ name: 123, parameters: {} })).toBe(
        false,
      );
      expect(isJobActionFunctionConfig({ name: 123 })).toBe(false);
      expect(
        isJobActionFunctionConfig({ name: 'test', parameters: null }),
      ).toBe(false);
      expect(
        isJobActionFunctionConfig({ name: 'test', parameters: 'string' }),
      ).toBe(false);
      expect(isJobActionFunctionConfig({ name: 'test', parameters: 123 })).toBe(
        false,
      );
    });
  });

  describe('isCreateAndExportOutputConfig', () => {
    it('should return true for valid CreateAndExportOutputConfig without outputAction', () => {
      const validConfig = {
        jobAction: {
          name: 'job-name',
          parameters: { param1: 'val1' },
        },
      };
      expect(isCreateAndExportOutputConfig(validConfig)).toBe(true);
    });

    it('should return true for valid CreateAndExportOutputConfig when jobAction has no parameters', () => {
      const validConfig = {
        jobAction: {
          name: 'job-name',
        },
      };
      expect(isCreateAndExportOutputConfig(validConfig)).toBe(true);
    });

    it('should return true for valid CreateAndExportOutputConfig with outputAction', () => {
      const validConfig = {
        jobAction: {
          name: 'job-name',
          parameters: { param1: 'val1' },
        },
        outputAction: {
          name: 'output-name',
          parameters: { outParam: 'val2' },
        },
      };
      expect(isCreateAndExportOutputConfig(validConfig)).toBe(true);
    });

    it('should return true for valid CreateAndExportOutputConfig when outputAction has no parameters', () => {
      const validConfig = {
        jobAction: {
          name: 'job-name',
        },
        outputAction: {
          name: 'output-name',
        },
      };
      expect(isCreateAndExportOutputConfig(validConfig)).toBe(true);
    });

    it('should return true when outputAction is explicitly undefined', () => {
      const validConfig = {
        jobAction: {
          name: 'job-name',
          parameters: { param1: 'val1' },
        },
        outputAction: undefined,
      };
      expect(isCreateAndExportOutputConfig(validConfig)).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(isCreateAndExportOutputConfig(null)).toBe(false);
      expect(isCreateAndExportOutputConfig(undefined)).toBe(false);
      expect(isCreateAndExportOutputConfig('string')).toBe(false);
      expect(isCreateAndExportOutputConfig(123)).toBe(false);
      expect(isCreateAndExportOutputConfig({})).toBe(false);
      expect(isCreateAndExportOutputConfig({ jobAction: null })).toBe(false);
      expect(isCreateAndExportOutputConfig({ jobAction: {} })).toBe(false);
      expect(
        isCreateAndExportOutputConfig({
          jobAction: { parameters: {} },
        }),
      ).toBe(false);
      expect(
        isCreateAndExportOutputConfig({
          jobAction: {
            name: 'job-name',
            parameters: null,
          },
        }),
      ).toBe(false);
      expect(
        isCreateAndExportOutputConfig({
          jobAction: {
            name: 'job-name',
            parameters: {},
          },
          outputAction: {
            name: 123,
          },
        }),
      ).toBe(false);
      expect(
        isCreateAndExportOutputConfig({
          jobAction: {
            name: 'job-name',
            parameters: {},
          },
          outputAction: null,
        }),
      ).toBe(false);
    });
  });
});
