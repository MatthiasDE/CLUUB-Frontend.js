<template>
    <div class="px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Time Recording
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

            <form @submit.prevent="submitTimeRecord" class="space-y-6">
                <!-- Member Selection with Fuzzy Search -->
                <div>
                    <label
                        for="member-search"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Member
                    </label>
                    <div class="relative">
                        <input
                            id="member-search"
                            v-model="searchQuery"
                            @input="handleSearchInput"
                            @focus="showDropdown = true"
                            type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Type at least 5 characters to search..."
                            required
                        />

                        <!-- Dropdown with search results -->
                        <div
                            v-if="showDropdown && searchResults.length > 0"
                            class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-300"
                        >
                            <div
                                v-for="member in searchResults"
                                :key="member.member_id"
                                @click="selectMember(member)"
                                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                            >
                                <div class="flex items-center">
                                    <span class="font-medium block truncate">
                                        {{ member.first_name }}
                                        {{ member.name }}
                                    </span>
                                    <span class="ml-2 text-gray-500 text-sm">
                                        (ID: {{ member.member_id }})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Selected member display -->
                        <div
                            v-if="selectedMember"
                            class="mt-2 text-sm text-gray-600"
                        >
                            Selected:
                            <span class="font-medium"
                                >{{ selectedMember.first_name }}
                                {{ selectedMember.name }}</span
                            >
                            (ID: {{ selectedMember.member_id }})
                        </div>
                    </div>
                </div>

                <!-- Start Date and Time -->
                <div>
                    <label
                        for="worktime-from"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Start Date and Time
                    </label>
                    <input
                        id="worktime-from"
                        v-model="worktimeFrom"
                        type="datetime-local"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <!-- End Date and Time -->
                <div>
                    <label
                        for="worktime-to"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        End Date and Time
                    </label>
                    <input
                        id="worktime-to"
                        v-model="worktimeTo"
                        type="datetime-local"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <!-- Operation Description -->
                <div>
                    <label
                        for="operation"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Operation Description
                    </label>
                    <textarea
                        id="operation"
                        v-model="operation"
                        maxlength="140"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the work done (max 140 characters)"
                    ></textarea>
                    <div class="mt-1 text-sm text-gray-500 text-right">
                        {{ operation.length }}/140 characters
                    </div>
                </div>

                <!-- Submit Button -->
                <div>
                    <button
                        type="submit"
                        :disabled="!selectedMember || isSubmitting"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {{ isSubmitting ? "Submitting..." : "Record Time" }}
                    </button>
                </div>
            </form>
        </div>

        <!-- Today's Time Records -->
        <div class="mt-8 bg-white shadow rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">
                Today's Time Records
            </h3>

            <div v-if="isLoadingRecords" class="text-center py-4 text-gray-500">
                Loading records...
            </div>

            <div
                v-else-if="todayRecords.length === 0"
                class="text-center py-4 text-gray-500"
            >
                No time records for today yet.
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Member ID
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Start Time
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                End Time
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Duration
                            </th>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Operation
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr
                            v-for="record in todayRecords"
                            :key="record.record_id"
                        >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                                {{ record.member_id }}
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                                {{ formatDateTime(record.worktime_from) }}
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                                {{ formatDateTime(record.worktime_to) }}
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                                {{
                                    calculateDuration(
                                        record.worktime_from,
                                        record.worktime_to,
                                    )
                                }}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                {{ record.operation || "-" }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { authService } from "../services/auth";

export default {
    name: "TimeRecording",
    data() {
        return {
            searchQuery: "",
            searchResults: [],
            selectedMember: null,
            showDropdown: false,
            worktimeFrom: "",
            worktimeTo: "",
            operation: "",
            errorMessage: "",
            successMessage: "",
            isSubmitting: false,
            todayRecords: [],
            isLoadingRecords: false,
            searchTimeout: null,
        };
    },
    mounted() {
        this.loadTodayRecords();
        // Click outside to close dropdown
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        handleSearchInput() {
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            // Only search if at least 5 characters
            if (this.searchQuery.length >= 5) {
                // Debounce the search
                this.searchTimeout = setTimeout(() => {
                    this.searchMembers();
                }, 300);
            } else {
                this.searchResults = [];
                this.showDropdown = false;
            }
        },

        async searchMembers() {
            try {
                const response = await fetch(
                    `/api/v1/members?search=${encodeURIComponent(this.searchQuery)}&fuzzy=true`,
                    {
                        headers: authService.getAuthHeader(),
                    },
                );
                if (!response.ok) {
                    throw new Error("Failed to search members");
                }
                this.searchResults = await response.json();
                this.showDropdown = true;
            } catch (error) {
                console.error("Error searching members:", error);
                this.errorMessage =
                    "Failed to search members. Please try again.";
                setTimeout(() => {
                    this.errorMessage = "";
                }, 5000);
            }
        },

        selectMember(member) {
            this.selectedMember = member;
            this.searchQuery = `${member.first_name} ${member.name}`;
            this.showDropdown = false;
            this.searchResults = [];
        },

        handleClickOutside(event) {
            if (!event.target.closest(".relative")) {
                this.showDropdown = false;
            }
        },

        async submitTimeRecord() {
            this.errorMessage = "";
            this.successMessage = "";

            if (!this.selectedMember) {
                this.errorMessage = "Please select a member";
                return;
            }

            // Validate end time is after start time
            if (new Date(this.worktimeTo) <= new Date(this.worktimeFrom)) {
                this.errorMessage = "End time must be after start time";
                return;
            }

            this.isSubmitting = true;

            try {
                const timeRecord = {
                    member_id: this.selectedMember.member_id,
                    worktime_from: new Date(this.worktimeFrom).toISOString(),
                    worktime_to: new Date(this.worktimeTo).toISOString(),
                    operation: this.operation || null,
                };

                const response = await fetch("/api/v1/timerecords", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authService.getAuthHeader(),
                    },
                    body: JSON.stringify(timeRecord),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.detail || "Failed to create time record",
                    );
                }

                this.successMessage = "Time record created successfully!";

                // Reset form
                this.selectedMember = null;
                this.searchQuery = "";
                this.worktimeFrom = "";
                this.worktimeTo = "";
                this.operation = "";

                // Reload today's records
                this.loadTodayRecords();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    this.successMessage = "";
                }, 5000);
            } catch (error) {
                console.error("Error creating time record:", error);
                this.errorMessage =
                    error.message ||
                    "Failed to create time record. Please try again.";
            } finally {
                this.isSubmitting = false;
            }
        },

        async loadTodayRecords() {
            this.isLoadingRecords = true;
            try {
                // Get today's date at midnight
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayISO = today.toISOString();

                const response = await fetch(
                    `/api/v1/timerecords?start_date=${encodeURIComponent(todayISO)}`,
                    {
                        headers: authService.getAuthHeader(),
                    },
                );
                if (!response.ok) {
                    throw new Error("Failed to load time records");
                }
                this.todayRecords = await response.json();
            } catch (error) {
                console.error("Error loading today's records:", error);
                this.errorMessage = "Failed to load today's records.";
            } finally {
                this.isLoadingRecords = false;
            }
        },

        formatDateTime(isoString) {
            if (!isoString) return "-";

            // Normalize the datetime string to ensure it's treated as UTC
            // SQLite returns strings without 'Z', so we add it if missing
            let dateString = isoString.trim();

            // Replace space with 'T' if needed (SQLite sometimes uses space)
            dateString = dateString.replace(" ", "T");

            // Add 'Z' suffix if no timezone indicator present
            if (
                !dateString.endsWith("Z") &&
                !dateString.includes("+") &&
                !dateString.includes("-", 10)
            ) {
                dateString += "Z";
            }

            const date = new Date(dateString);

            // Display in Europe/Berlin timezone
            return date.toLocaleString("de-DE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Berlin",
            });
        },

        calculateDuration(from, to) {
            if (!from || !to) return "-";

            // Normalize datetime strings (same as formatDateTime)
            let fromString = from.trim().replace(" ", "T");
            let toString = to.trim().replace(" ", "T");

            if (
                !fromString.endsWith("Z") &&
                !fromString.includes("+") &&
                !fromString.includes("-", 10)
            ) {
                fromString += "Z";
            }
            if (
                !toString.endsWith("Z") &&
                !toString.includes("+") &&
                !toString.includes("-", 10)
            ) {
                toString += "Z";
            }

            const start = new Date(fromString);
            const end = new Date(toString);
            const diffMs = end - start;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(
                (diffMs % (1000 * 60 * 60)) / (1000 * 60),
            );
            return `${diffHours}h ${diffMinutes}m`;
        },
    },
};
</script>
