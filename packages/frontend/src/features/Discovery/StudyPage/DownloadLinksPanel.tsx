

const DownloadLinksPanel = () => {
  return (
    {props.config.studyPageFields.downloadLinks
      && props.config.studyPageFields.downloadLinks.field
      && props.modalData[
        props.config.studyPageFields.downloadLinks.field
        ] ? (
        <Collapse
          className='discovery-modal__download-panel'
          defaultActiveKey={['1']}
        >
          <Panel
            className='discovery-modal__download-panel-header'
            header={
              props.config.studyPageFields.downloadLinks.name
              || 'Data Download Links'
            }
            key='1'
          >
            <List
              itemLayout='horizontal'
              dataSource={
                props.modalData[
                  props.config.studyPageFields.downloadLinks.field
                  ]
              }
              renderItem={(item: ListItem) => (
                <List.Item
                  actions={[
                    <Button
                      className='discovery-modal__download-button'
                      href={`${fenceDownloadPath}/${item.guid}?expires_in=900&redirect`}
                      target='_blank'
                      type='text'
                      // disable button if data has no GUID
                      disabled={!item.guid}
                      icon={<DownloadOutlined />}
                    >
                      Download File
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={(
                      <div className='discovery-modal__download-list-title'>
                        {item.title}
                      </div>
                    )}
                    description={(
                      <div className='discovery-modal__download-list-description'>
                        {item.description || ''}
                      </div>
                    )}
                  />
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
  );
};

export default DownloadLinksPanel;
