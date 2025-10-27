// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        profile {
          name
          bio
        }
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        profile {
          name
          bio
        }
      }
    }
  }
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      profile {
        name
        bio
      }
    }
  }
`;

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'INITIALIZE_AUTH':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || null,
        isAuthenticated: !!action.payload.token,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [getCurrentUser] = useLazyQuery(GET_CURRENT_USER);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (token) {
      // If we have a token, fetch the current user
      getCurrentUser()
        .then(({ data }) => {
          dispatch({ 
            type: 'INITIALIZE_AUTH', 
            payload: { 
              token, 
              user: data?.me 
            } 
          });
        })
        .catch((error) => {
          console.error('Failed to fetch current user:', error);
          // If token is invalid, remove it
          localStorage.removeItem('token');
          dispatch({ 
            type: 'INITIALIZE_AUTH', 
            payload: { token: null } 
          });
        });
    } else {
      dispatch({ 
        type: 'INITIALIZE_AUTH', 
        payload: { token: null } 
      });
    }
  }, [getCurrentUser]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: data.login.token,
          user: data.login.user
        }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Login failed'
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password, profile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data } = await registerMutation({
        variables: {
          input: { username, email, password, profile }
        }
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: data.register.token,
          user: data.register.user
        }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Registration failed'
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};