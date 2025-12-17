// This function is to be used to fetch data from CHURCH endpoints only
export function fetchData(url: string, refreshToken: string, churchId: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Cookie: `oauth-abw_church_account_id=${churchId}; oauth-abw_refresh_token=${refreshToken}`,
      "Content-Type": "application/json",
    },
  });
}
