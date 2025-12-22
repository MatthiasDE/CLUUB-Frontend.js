<template>
  <div class="px-4 sm:px-0">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">List Members</h2>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ errorMessage }}</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8 text-gray-500">
        Loading members...
      </div>

      <!-- Empty State -->
      <div v-else-if="members.length === 0" class="text-center py-8 text-gray-500">
        No members found. Create a new member to get started.
      </div>

      <!-- Members Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('member_id')"
              >
                <div class="flex items-center">
                  ID
                  <span class="ml-1">
                    <svg v-if="sortField === 'member_id' && sortDirection === 'asc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="sortField === 'member_id' && sortDirection === 'desc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('first_name')"
              >
                <div class="flex items-center">
                  First Name
                  <span class="ml-1">
                    <svg v-if="sortField === 'first_name' && sortDirection === 'asc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="sortField === 'first_name' && sortDirection === 'desc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('name')"
              >
                <div class="flex items-center">
                  Last Name
                  <span class="ml-1">
                    <svg v-if="sortField === 'name' && sortDirection === 'asc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="sortField === 'name' && sortDirection === 'desc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="member in sortedMembers" :key="member.member_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ member.member_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ member.first_name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ member.name || '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Member Count -->
        <div class="mt-4 text-sm text-gray-500">
          Total members: {{ members.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListMembers',
  data() {
    return {
      members: [],
      isLoading: false,
      errorMessage: '',
      sortField: 'member_id',
      sortDirection: 'asc'
    }
  },
  computed: {
    sortedMembers() {
      const sorted = [...this.members].sort((a, b) => {
        let aValue = a[this.sortField]
        let bValue = b[this.sortField]

        // Handle null/undefined values
        if (aValue == null) aValue = ''
        if (bValue == null) bValue = ''

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()

        if (aValue < bValue) {
          return this.sortDirection === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return this.sortDirection === 'asc' ? 1 : -1
        }
        return 0
      })

      return sorted
    }
  },
  mounted() {
    this.loadMembers()
  },
  methods: {
    async loadMembers() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await fetch('/api/v1/members?limit=1000')
        if (!response.ok) {
          throw new Error('Failed to load members')
        }
        this.members = await response.json()
      } catch (error) {
        console.error('Error loading members:', error)
        this.errorMessage = 'Failed to load members. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    sortBy(field) {
      if (this.sortField === field) {
        // Toggle direction if clicking the same field
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        // Set new field and default to ascending
        this.sortField = field
        this.sortDirection = 'asc'
      }
    }
  }
}
</script>
