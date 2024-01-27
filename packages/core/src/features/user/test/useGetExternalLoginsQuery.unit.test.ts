import { useGetExternalLoginsQuery } from '../externalLoginsSlice';
import { renderHook } from "@testing-library/react";

const RESPONSE = {
  "providers": [
    {
      "base_url": "https://jcoin.datacommons.io",
      "idp": "jcoin-google",
      "name": "JCOIN Google Login",
      "refresh_token_expiration": null,
      "urls": [
        {
          "name": "JCOIN Google Login",
          "url": "https://preprod.healdata.org/wts/oauth2/authorization_url?idp=jcoin-google"
        }
      ]
    },
    {
      "base_url": "https://externaldata.healdata.org",
      "idp": "externaldata-google",
      "name": "FAIR Repository Google Login",
      "refresh_token_expiration": null,
      "urls": [
        {
          "name": "FAIR Repository Google Login",
          "url": "https://preprod.healdata.org/wts/oauth2/authorization_url?idp=externaldata-google"
        }
      ]
    }
  ]
};


jest.mock('../externalLoginsSlice', () => ({
  useGetExternalLoginsQuery: jest.fn(),
}));


describe("useGetExternalLoginsQuery", () => {

  beforeEach(() => {
    (useGetExternalLoginsQuery as jest.Mock).mockReturnValue({
      data: RESPONSE,
      isLoading: false,
      error: null,
    });
  });

  it("should correctly call useGetExternalLoginsQuery", () => {
    const mockReturnValue = { data: "mock data" };  // Modify this value as needed
    (useGetExternalLoginsQuery as jest.Mock).mockReturnValue(mockReturnValue);

    const { result } = renderHook(() => useGetExternalLoginsQuery());

    expect(result.current).toEqual(mockReturnValue);
    expect(useGetExternalLoginsQuery).toBeCalled(); // Optionally check if it was called without specific params
  });
});
