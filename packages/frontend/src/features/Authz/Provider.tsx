import {
  createContext,
  useContext,
  Dispatch,
  ReactElement,
  useReducer,
} from 'react';
import {
  Authz,
  Group,
  Role,
  Policy,
  Permission,
  Resource,
  User,
} from './types';

type AuthzContextAction = {
  type: 'addUser' | 'removeUser';
  payload: {
    user?: User;
    role?: Role;
    policy?: Policy;
    group?: Group;
    permission?: Permission;
    resource?: Resource;
    value?: string;
  };
};

export const authzReducer = (state: Authz, action: AuthzContextAction) => {
  switch (action.type) {
    case 'addUser':
      return {
        ...state,
        authz: { ...state, users: [...state.users, action.payload.user] },
      };
    case 'removeUser':
      return {
        ...state,
        authz: {
          ...state,
          users: state.users.filter(
            (user) => user.id !== action.payload?.user?.id,
          ),
        },
      };
    default:
      return state;
  }
};

export const AuthzContext = createContext<{
  state: Authz;
  dispatch: Dispatch<AuthzContextAction>;
}>({
  state: {
    users: [],
    groups: [],
    roles: [],
    policies: [],
    resources: [],
  },
  dispatch: () => null,
});

interface AuthzProviderProps {
  children: ReactElement;
  authz: Authz;
}

export const AuthzProvider = ({
  children,
  authz = {
    users: [],
    groups: [],
    roles: [],
    policies: [],
    resources: [],
  },
}: AuthzProviderProps) => {
  const [state, dispatch] = useReducer(authzReducer, authz);
  return (
    <AuthzContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthzContext.Provider>
  );
};

export const useAuthzContext = () => useContext(AuthzContext);
