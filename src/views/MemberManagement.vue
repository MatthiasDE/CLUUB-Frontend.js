<template>
    <div class="px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg p-6 max-w-2xl">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Member Management
            </h2>

            <!-- Error Message -->
            <div
                v-if="errorMessage"
                class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <span class="block sm:inline">{{ errorMessage }}</span>
            </div>

            <!-- Success Message -->
            <div
                v-if="successMessage"
                class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <span class="block sm:inline">{{ successMessage }}</span>
            </div>

            <form @submit.prevent="submitMember" class="space-y-6">
                <!-- Member ID -->
                <div>
                    <label
                        for="member-id"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Member ID <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="member-id"
                        v-model.number="memberId"
                        type="number"
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter unique member ID"
                        required
                    />
                    <p class="mt-1 text-sm text-gray-500">
                        Unique identifier for the member (must be positive
                        integer)
                    </p>
                </div>

                <!-- First Name -->
                <div>
                    <label
                        for="first-name"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        First Name (Vorname) <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="first-name"
                        v-model="firstName"
                        type="text"
                        maxlength="255"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter first name"
                        required
                    />
                </div>

                <!-- Last Name -->
                <div>
                    <label
                        for="last-name"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Last Name (Name) <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="last-name"
                        v-model="lastName"
                        type="text"
                        maxlength="255"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter last name"
                        required
                    />
                </div>

                <!-- Submit Button -->
                <div class="flex space-x-4">
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {{ isSubmitting ? "Creating..." : "Create Member" }}
                    </button>

                    <button
                        type="button"
                        @click="resetForm"
                        class="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Clear Form
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { authService } from "../services/auth";

export default {
    name: "MemberManagement",
    data() {
        return {
            memberId: null,
            firstName: "",
            lastName: "",
            errorMessage: "",
            successMessage: "",
            isSubmitting: false,
        };
    },
    methods: {
        async submitMember() {
            this.errorMessage = "";
            this.successMessage = "";

            // Validation
            if (!this.memberId || this.memberId < 1) {
                this.errorMessage =
                    "Please enter a valid member ID (positive integer)";
                return;
            }

            if (!this.firstName.trim()) {
                this.errorMessage = "Please enter a first name";
                return;
            }

            if (!this.lastName.trim()) {
                this.errorMessage = "Please enter a last name";
                return;
            }

            this.isSubmitting = true;

            try {
                const member = {
                    member_id: this.memberId,
                    first_name: this.firstName.trim(),
                    name: this.lastName.trim(),
                };

                const response = await fetch("/api/v1/members", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authService.getAuthHeader(),
                    },
                    body: JSON.stringify(member),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.detail || "Failed to create member",
                    );
                }

                const createdMember = await response.json();
                this.successMessage = `Member created successfully! ID: ${createdMember.member_id}, Name: ${createdMember.first_name} ${createdMember.name}`;

                // Reset form
                this.resetForm();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    this.successMessage = "";
                }, 5000);
            } catch (error) {
                console.error("Error creating member:", error);
                this.errorMessage =
                    error.message ||
                    "Failed to create member. Please try again.";
            } finally {
                this.isSubmitting = false;
            }
        },

        resetForm() {
            this.memberId = null;
            this.firstName = "";
            this.lastName = "";
            this.errorMessage = "";
        },
    },
};
</script>
