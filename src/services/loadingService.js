let _show = () => {};
let _hide = () => {};

export const setLoadingHandlers = (showFn, hideFn) => {
  _show = showFn || (()=>{});
  _hide = hideFn || (()=>{});
};

export const showLoading = () => _show();
export const hideLoading = () => _hide();
