// Module-level store for portfolio File objects during onboarding.
// sessionStorage can't hold binary File objects, so we keep them here.
// These are cleared after account creation or on page refresh.
let _files: File[] = [];

export function setPendingPortfolioFiles(files: File[]) {
  _files = [...files];
}

export function getPendingPortfolioFiles(): File[] {
  return _files;
}

export function clearPendingPortfolioFiles() {
  _files = [];
}
