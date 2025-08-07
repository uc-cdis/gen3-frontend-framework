import { useDispatch, useSelector } from 'react-redux';
import { CoreDispatch } from './store';
import { CoreState } from './reducers';

// From here down is react-related code. If we wanted to create a UI-agnotic core,
// we could need to move the following code and the provider into a new workspace,
// such as core-react.

/**
 * The initial context is never used in practice. A little casting voodoo to satisfy TS.
 *
 * Note: Should the action type be AnyAction (from redux) or PayloadAction (from redux-toolkit)?
 * If we are creating all of our actions through RTK, then PayloadAction might be the
 * correct opinionated type.
 */

export const useCoreSelector = useSelector.withTypes<CoreState>();
export const useCoreDispatch = useDispatch.withTypes<CoreDispatch>();
