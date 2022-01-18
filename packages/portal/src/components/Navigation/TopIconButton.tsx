
const TopIconButton = ({
                           name, icon, onActiveTab = () => {}, isActive = false, tabIndex = '0',
                       }) => (
    <div
        className={isActive ? 'top-icon-button button-top-active body-typo' : 'top-icon-button body-typo'}
        onClick={onActiveTab}
        onKeyDown={onActiveTab}
        role='button'
        tabIndex={tabIndex}
    >
        {name}&nbsp;{icon ? (
        <i
            className={`g3-icon g3-icon--${icon} top-icon-button__icon`}
        />
    ) : ''}
    </div>
);
