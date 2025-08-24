// Import the AuthProvider type from Refine
import type { AuthProvider } from "@refinedev/core";

// Import API URL and dataProvider (used to make API calls)
import { API_URL, dataProvider } from "./data";
import { User } from "@/graphql/schema.types";

// Demo credentials (used for login testing)
export const authCredentials = {
    email: "leythan@dundermifflin.com",
    password: "demodemo",
};

// Define the authProvider object used by Refine for authentication
export const authProvider: AuthProvider = {
    // LOGIN FUNCTION
    login: async ({ email }) => {
        try {
            // Send a GraphQL mutation to login with email
            const { data } = await dataProvider.custom({
                url: API_URL,
                method: "post",
                headers: {}, // No headers initially
                meta: {
                    // Pass email as a variable to the query
                    variables: { email },
                    // GraphQL mutation string
                    rawQuery: `
                        mutation Login($email: String!) {
                            login(loginInput: {
                                email: $email
                            }) {
                                accessToken
                            }
                        }
                    `,
                },
            });

            // Store access token in localStorage
            localStorage.setItem("access_token", data.login.accessToken);

            // Login success - redirect to homepage
            return {
                success: true,
                redirectTo: "/",
            };
        } catch (e) {
            const error = e as Error;

            // Return failure response with error details
            return {
                success: false,
                error: {
                    message: "message" in error ? error.message : "Login failed",
                    name: "name" in error ? error.name : "Invalid email or password",
                },
            };
        }
    },

    // LOGOUT FUNCTION
    logout: async () => {
        // Remove access token from localStorage
        localStorage.removeItem("access_token");

        // Redirect to login page
        return {
            success: true,
            redirectTo: "/login",
        };
    },

    // ERROR HANDLING FUNCTION
    onError: async (error) => {
        // If user is unauthenticated, force logout
        if (error.statusCode === "UNAUTHENTICATED") {
            return {
                logout: true,
            };
        }

        // Otherwise return the error
        return { error };
    },

    // AUTH CHECK FUNCTION (to validate if user is still logged in)
    check: async () => {
        try {
            // Make a GraphQL query to check if the user is authenticated
            await dataProvider.custom({
                url: API_URL,
                method: "post",
                headers: {},
                meta: {
                    rawQuery: `
                        query Me {
                            me {
                                name
                            }
                        }
                    `,
                },
            });

            // If query succeeds, user is authenticated
            return {
                authenticated: true,
                redirectTo: "/",
            };
        } catch (error) {
            // If query fails, user is not authenticated
            return {
                authenticated: false,
                redirectTo: "/login",
            };
        }
    },

    // GET USER INFO FUNCTION (returns the current logged-in user data)
    getIdentity: async () => {
        // Get access token from localStorage
        const accessToken = localStorage.getItem("access_token");

        try {
            // Call the 'me' GraphQL query to get user info
            const { data } = await dataProvider.custom<{ me: User }>({
                url: API_URL,
                method: "post",
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {},
                meta: {
                    rawQuery: `
                        query Me {
                            me {
                                id,
                                name,
                                email,
                                phone,
                                jobTitle,
                                timezone,
                                avatarUrl
                            }
                        }
                    `,
                },
            });

            // Return the user info
            return data.me;
        } catch (error) {
            // If something goes wrong, return undefined
            return undefined;
        }
    },
};
