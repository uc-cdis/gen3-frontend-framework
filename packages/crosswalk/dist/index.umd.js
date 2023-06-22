(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@gen3/core'), require('react'), require('@mantine/core'), require('@mantine/hooks')) :
  typeof define === 'function' && define.amd ? define(['exports', '@gen3/core', 'react', '@mantine/core', '@mantine/hooks'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.crosswalk = {}, global.gen3Core, global.React, global.mantine, global.mantineHooks));
})(this, (function (exports, core, React$1, core$1, hooks) { 'use strict';

  const crosswalkAPI = core.gen3Api.injectEndpoints({
      endpoints: (builder)=>({
              getCrosswalkData: builder.query({
                  query: (params)=>({
                          url: `metadata?${params.ids}`
                      }),
                  transformResponse: (response, _meta, params)=>{
                      return {
                          mapping: Object.values(response).map((x)=>{
                              return {
                                  from: x.ids[params.fields.from],
                                  to: x.ids[params.fields.to]
                              };
                          })
                      };
                  }
              })
          })
  });
  const { useGetCrosswalkDataQuery } = crosswalkAPI;

  const MIN_ROWS = 18;
  const downloadData = (data)=>{
      const csvData = encodeURI(`data:text/csv;charset=utf-8,${data}`);
      const link = document.createElement('a');
      link.href = csvData;
      link.download = 'crosswalk_data.csv';
      document.body.appendChild(link); // This can any part of your website
      link.click();
      document.body.removeChild(link);
  };
  const Crosswalk = ({ fromTitle, toTitle, guidField, fromField, toField })=>{
      const [query, setQuery] = React$1.useState('');
      const [sourceIds, setSourceIds] = React$1.useState('');
      const { data, isSuccess } = useGetCrosswalkDataQuery({
          ids: query,
          fields: {
              from: fromField,
              to: toField
          }
      }, {
          skip: query === ''
      });
      const [crosswalkIds, setCrosswalkIds] = React$1.useState('');
      const clipboard = hooks.useClipboard({
          timeout: 500
      });
      const previousField = core.usePrevious(fromField);
      const updateIdQuery = (values)=>{
          setSourceIds(values);
      };
      React$1.useEffect(()=>{
          if (isSuccess) {
              setCrosswalkIds(data.mapping.map((cw)=>cw.to).join('\n'));
          }
      }, [
          data,
          isSuccess
      ]);
      const clear = ()=>{
          setSourceIds('');
          setCrosswalkIds('');
          setQuery('');
      };
      React$1.useEffect(()=>{
          if (previousField != fromField) clear();
      }, [
          previousField,
          fromField
      ]);
      const onSubmit = ()=>{
          const ids = sourceIds.split(/,|\r?\n|\r|\n/g).map((x)=>`ids.${fromField}=${x}`).join('&');
          setQuery(`_guid_type=${guidField}&data=True&${ids}`);
      };
      return /*#__PURE__*/ React$1.createElement(core$1.Group, {
          grow: true,
          className: "w-100 h-100 p-4 mt-4"
      }, /*#__PURE__*/ React$1.createElement(core$1.Stack, null, /*#__PURE__*/ React$1.createElement(core$1.Group, null, /*#__PURE__*/ React$1.createElement(core$1.Text, null, fromTitle), /*#__PURE__*/ React$1.createElement(core$1.Button, {
          variant: "outline",
          size: "xs",
          disabled: sourceIds.length == 0,
          onClick: ()=>onSubmit()
      }, "Submit"), /*#__PURE__*/ React$1.createElement(core$1.Button, {
          variant: "outline",
          size: "xs",
          disabled: sourceIds.length == 0,
          onClick: ()=>clear()
      }, "Clear")), /*#__PURE__*/ React$1.createElement(core$1.Textarea, {
          placeholder: "IDs...",
          radius: "md",
          size: "md",
          required: true,
          value: sourceIds,
          minRows: MIN_ROWS,
          onChange: (event)=>updateIdQuery(event.currentTarget.value)
      })), /*#__PURE__*/ React$1.createElement(core$1.Stack, null, /*#__PURE__*/ React$1.createElement(core$1.Group, null, /*#__PURE__*/ React$1.createElement(core$1.Text, null, toTitle), /*#__PURE__*/ React$1.createElement(core$1.Group, {
          position: "right"
      }, /*#__PURE__*/ React$1.createElement(core$1.Button, {
          variant: "outline",
          size: "xs",
          color: clipboard.copied ? 'teal' : 'blue',
          onClick: ()=>{
              if (data) clipboard.copy(data.mapping.map((x)=>x.to));
          },
          disabled: crosswalkIds.length == 0
      }, "Copy"), /*#__PURE__*/ React$1.createElement(core$1.Button, {
          variant: "outline",
          size: "xs",
          onClick: ()=>{
              if (data) downloadData(data.mapping.map((x)=>`${x.from},${x.to}`).join('\n'));
          },
          disabled: crosswalkIds.length == 0
      }, "Download"))), /*#__PURE__*/ React$1.createElement(core$1.Textarea, {
          placeholder: "Results...",
          radius: "md",
          size: "md",
          value: crosswalkIds,
          readOnly: true,
          minRows: MIN_ROWS
      })));
  };

  const ConfigurableCrosswalk = ({ converters })=>{
      const selectedData = React$1.useMemo(()=>Object.entries(converters).map(([key, value])=>{
              return {
                  label: value.title,
                  value: key,
                  data: value
              };
          }), [
          converters
      ]);
      const [selectedConverter, setSelectedConverter] = React$1.useState(selectedData[0].value);
      const [converter, setConverter] = React$1.useState(Object.values(converters)[0]);
      const selectConverter = (s)=>{
          setSelectedConverter(s);
          setConverter(converters[s]);
      };
      return /*#__PURE__*/ React$1.createElement(core$1.Stack, null, /*#__PURE__*/ React$1.createElement("div", {
          className: "flex px-4"
      }, /*#__PURE__*/ React$1.createElement(core$1.Select, {
          label: "Select Converter",
          placeholder: "Pick one",
          data: selectedData,
          value: selectedConverter,
          onChange: selectConverter
      })), /*#__PURE__*/ React$1.createElement(Crosswalk, converter));
  };

  const CrosswalkConfig = {
      N3C: {
          title: 'MIDRC to N3C',
          guidField: 'n3c_crosswalk',
          fromTitle: 'Enter your MIDRC Ids',
          toTitle: 'Matching N3C IDs',
          fromField: 'midrc_id',
          toField: 'n3c_id'
      },
      Petal: {
          title: 'BDCat to MIDRC',
          guidField: 'petal_crosswalk',
          fromTitle: 'Enter your BDCat Ids',
          toTitle: 'Matching MIDRC IDs',
          fromField: 'bdcat_id',
          toField: 'midrc_id'
      }
  };
  const CrosswalkApp = ()=>{
      return /*#__PURE__*/ React.createElement(ConfigurableCrosswalk, {
          converters: CrosswalkConfig
      });
  };

  const registerApp = ()=>{
      core.createGen3App({
          App: CrosswalkApp,
          name: 'crosswalk',
          version: '0.0.1',
          requiredEntityTypes: []
      });
  };

  exports.registerApp = registerApp;

}));
