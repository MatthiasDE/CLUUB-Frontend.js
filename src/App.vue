<template>
    <div id="app" class="min-h-screen bg-gray-50">
        <nav
            v-if="authState.isAuthenticated"
            class="bg-white shadow-sm border-b border-gray-200"
        >
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <h1 class="text-xl font-bold text-blue-600">
                                CLUUB
                            </h1>
                        </div>
                        <div class="ml-6 flex space-x-8">
                            <router-link
                                to="/time-recording"
                                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                                :class="
                                    $route.path === '/time-recording'
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                "
                            >
                                Time Recording
                            </router-link>
                            <router-link
                                to="/member-management"
                                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                                :class="
                                    $route.path === '/member-management'
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                "
                            >
                                Member Management
                            </router-link>
                            <router-link
                                to="/list-members"
                                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                                :class="
                                    $route.path === '/list-members'
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                "
                            >
                                List Members
                            </router-link>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <div
                            v-if="authState.user"
                            class="flex items-center mr-4"
                        >
                            <img
                                v-if="authState.user.picture"
                                :src="authState.user.picture"
                                class="h-8 w-8 rounded-full border border-gray-200 mr-2"
                                alt="User profile"
                            />
                            <span
                                class="hidden sm:inline text-sm text-gray-700 font-medium"
                            >
                                {{ authState.user.name }}
                            </span>
                        </div>
                        <button
                            @click="handleLogout"
                            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <router-view />
        </main>
    </div>
</template>

<script>
import { authState, authService } from "./services/auth";

export default {
    name: "App",
    setup() {
        return {
            authState,
        };
    },
    methods: {
        handleLogout() {
            if (confirm("Are you sure you want to sign out?")) {
                authService.logout();
            }
        },
    },
};
</script>

<style>
/* Custom transitions for router-view if needed */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
