import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

import { User, Playground, Token } from "../../types";
import { setLogin, setLogout } from "../auth/authSlice";
import { pushError } from "../slices/errorSlice";

const mutex = new Mutex();
const backendUrl = process.env.SERVER_URL || "http://localhost:5000";

const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  prepareHeaders: (headers, { getState }) => {
    let token = (getState() as any).auth.token;

    if (!token) {
      token = localStorage.getItem("token");
    }
    // if(!token) {
    //   token = localStorage.getItem("token");
    // }
    // const userId = (getState() as any).auth.userId;
    // console.log(userId);
    // console.log(token);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  // console.log(args, api, extraOptions);
  let result = await baseQuery(args, api, extraOptions);
  // console.log("Result from baseQuery:", result);
  // console.log(result);
  if (result.error?.status === 401) {
    if (mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const { refreshToken } = (api.getState() as any).auth;
        const refreshResult = await baseQuery(
          {
            method: "PATCH",
            url: "/auth/refresh-token",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          await localStorage.setItem(
            "token",
            (refreshResult.data as any).data.token
          );
          await localStorage.setItem(
            "refreshToken",
            (refreshResult.data as any).data.refreshToken
          );
          api.dispatch(setLogin((refreshResult.data as any).data));

          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(
            pushError({
              title: "Your session has expired",
              description: "Please login again.",
            })
          );
          api.dispatch(setLogout());
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const serverApi = createApi({
  reducerPath: "serverApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Token", "User", "YourPlaygrounds", "JoinedPlaygrounds"],
  endpoints: (builder) => ({
    //auth
    register: builder.mutation<Token, { email: string; password: string ; username : string ; confirmPassword:string }>({
      query: (body) => ({ url: "/api/users/register", method: "POST", body }),
      invalidatesTags: ["Token"],
    }),

    login: builder.mutation<Token, { email: string; password: string }>({
      query: (body) => (
        console.log(body), { url: "/api/users/login", method: "POST", body }
      ),

      invalidatesTags: ["Token"],
      transformResponse: async (response: any, meta, arg) => {
        const { token, refreshToken } = response.data;

        // console.log("Token:", token);
        // console.log("RefreshToken:", refreshToken);

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        return { token, refreshToken };
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/api/users/logout", method: "POST" }),
      invalidatesTags: ["Token"],
      
      transformResponse: (response: any, meta, arg) => {
        console.log("Second Logging out initiated");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      },
    }),

    getUserData: builder.query<User, string>({
      query: (userId) => ({ url: `/api/users/user-data`, method: "GET" }),
      providesTags: ["User"],
      transformResponse: async (response: any, meta, arg) => {
        return response.data.user;
      },
    }),

    //playgrounds
    createPlayground: builder.mutation<
      Playground,
      {
        name: string;
        language: string;
        roomId: string;
        code: string;
      }
    >({
      query: (body) => ({
        url: "/api/playground/create",
        method: "POST",
        body,
      }),
      transformResponse: async (response: any, meta, arg) => {
        return response.data.playground;
      },
    }),

    getYourPlaygrounds: builder.query<Playground[], void>({
      query: () => {
        // console.log("Getting your playgrounds");
        return {
          url: "/api/playground/get-your-playgrounds",
          method: "GET",
        };
      },
      providesTags: ["YourPlaygrounds"],
      transformResponse: async (response: any, meta, arg) => {
        return response.data.playgrounds;
      },
    }),

    getJoinedPlaygrounds: builder.query<Playground[], void>({
      query: () => ({
        url: "/api/playground/get-joined-playgrounds",
        method: "GET",
      }),
      providesTags: ["JoinedPlaygrounds"],
      transformResponse: async (response: any, meta, arg) => {
        return response.data.playgrounds;
      },
    }),

    sendRequest: builder.mutation<void, { roomId : string }>({
      query: (body) => ({
        url: "/api/playground/request-to-join",
        method: "POST",
        body,
      }),
    }),

    approveRequest: builder.mutation<void, { roomId : string , userId : string}>({
      query: (body) => ({
        url: "/api/playground/approve-join-request",
        method: "POST",
        body,
      }),
    }),

    rejectRequest: builder.mutation<void, { roomId : string , userId : string}>({
      query: (body) => ({
        url: "/api/playground/reject-join-request",
        method: "POST",
        body,
      }),
    }),

  }),
});

export const {
  useLoginMutation,
  useGetUserDataQuery,
  useLogoutMutation,
  useCreatePlaygroundMutation,
  useGetYourPlaygroundsQuery,
  useGetJoinedPlaygroundsQuery,
  useSendRequestMutation,
  useRegisterMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
} = serverApi;
