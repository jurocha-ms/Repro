# `Invalid response for blob:`

This sample reproduces React Native Windows bug [#11439](https://github.com/microsoft/react-native-windows/issues/11439).

Due to a native module dependency race condition between `Blob` and `Http`, `fetch` requests may fail with error `Invalid response for blob`.

This sample app provides the following:
- A React Native Windows app making a trivial `fetch` request on load, and a button to make subsequent requests.
- A boolean variable in the app's native entry point (`App.cpp`) to toggle the `UseWebDebugger` property.\
  ```cpp
  bool directDebug = true;
  ```
  *While not the only possible one, setting `UseWebDebugger` to `false` triggers the bug.*
- A React Native macOS projection of the app for control/reference.

## Environment

- `react-native-windows` version `0.72.2` and earlier

## Instructions

```pwsh
yarn
npx react-native start-windows
```
