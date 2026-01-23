declare module 'react-native/Libraries/Core/ExceptionsManager' {
  export function handleException(err: Error, isFatal: boolean): void;
}

declare module 'react-native-web-refresh-control' {
  import { RefreshControlProps } from 'react-native';
  import { ComponentType } from 'react';
  export const RefreshControl: ComponentType<RefreshControlProps>;
}
