<template>
    <div
        class="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h1 class="text-center text-4xl font-extrabold text-blue-600 mb-2">
                CLUUB
            </h1>
            <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
                Sign in to your account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Association Management & Time Recording
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div
                class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 text-center"
            >
                <p class="mb-6 text-gray-700">
                    Please use your Google account to access the platform.
                </p>

                <div class="flex justify-center">
                    <!-- Google Sign-In Button Container -->
                    <div id="google-signin-button"></div>
                </div>

                <div v-if="error" class="mt-4 text-red-600 text-sm">
                    {{ error }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { authService } from "../services/auth";

export default {
    name: "Login",
    data() {
        return {
            error: null,
        };
    },
    mounted() {
        this.initGoogleSignIn();
    },
    methods: {
        initGoogleSignIn() {
            // Wait for Google script to load if it hasn't yet
            if (typeof google === "undefined") {
                setTimeout(this.initGoogleSignIn, 100);
                return;
            }

            try {
                /* global google */
                google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: this.handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                google.accounts.id.renderButton(
                    document.getElementById("google-signin-button"),
                    {
                        theme: "outline",
                        size: "large",
                        width: "100%",
                        text: "signin_with",
                        shape: "rectangular",
                    },
                );
            } catch (err) {
                console.error("Google Sign-In initialization failed", err);
                this.error =
                    "Failed to initialize Google Sign-In. Please check your connection.";
            }
        },
        handleCredentialResponse(response) {
            try {
                authService.handleSignIn(response);
                // Redirect to dashboard/home after successful login
                this.$router.push("/time-recording");
            } catch (err) {
                console.error("Sign-in handling failed", err);
                this.error = "Login failed. Please try again.";
            }
        },
    },
};
</script>
