import { z } from "zod";
import { Tool, axiosInstance } from "./utils.js";

export const tools: Record<string, Tool> = {
  // ==================== CONNECTIONS ====================
  "fivetran-create-connect-card": {
    config: {
      title: "Create Connect Card",
      description: "Create a Connect Card for user-managed connector setup",
      inputSchema: {
        connectionId: z.string().describe("The connector ID"),
        redirectUri: z
          .string()
          .describe(
            "Redirect URI after setup (must start with http:// or https://)"
          ),
        hideSetupGuide: z
          .boolean()
          .optional()
          .describe("Hide the setup guide (default: false)"),
      },
    },
    handler: async ({ connectionId, redirectUri, hideSetupGuide }: any) => {
      const response = await axiosInstance.post(
        `/connections/${connectionId}/connect-card`,
        {
          connect_card_config: {
            redirect_uri: redirectUri,
            hide_setup_guide: hideSetupGuide,
          },
        }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-create-connection": {
    config: {
      title: "Create Connection",
      description: "Create a new Fivetran connector",
      inputSchema: {
        groupId: z.string().describe("The group ID"),
        service: z
          .string()
          .describe(
            "The connector service type (e.g., 'google_ads', 'salesforce')"
          ),
        trustCertificates: z
          .boolean()
          .optional()
          .describe("Auto-trust certificates"),
        trustFingerprints: z
          .boolean()
          .optional()
          .describe("Auto-trust fingerprints"),
        runSetupTests: z
          .boolean()
          .optional()
          .describe("Run setup tests automatically"),
        paused: z
          .boolean()
          .optional()
          .describe("Start connector in paused state"),
        pauseAfterTrial: z
          .boolean()
          .optional()
          .describe("Pause after trial period"),
        syncFrequency: z.number().optional().describe("Minutes between syncs"),
        dailySyncTime: z
          .string()
          .optional()
          .describe(
            "Daily sync time (HH:MM format, requires sync_frequency=1440)"
          ),
        scheduleType: z
          .enum(["auto", "manual"])
          .optional()
          .describe("Sync schedule type"),
        connectCardConfig: z
          .object({
            redirectUri: z.string().url(),
            hideSetupGuide: z.boolean().optional(),
          })
          .optional()
          .describe("Connect Card configuration"),
      },
    },
    handler: async ({ groupId, service, ...config }: any) => {
      const payload: any = {
        groupId,
        service,
        trust_certificates: config.trustCertificates ?? undefined,
        trust_fingerprints: config.trustFingerprints ?? undefined,
        run_setup_tests: config.runSetupTests ?? undefined,
        paused: config.paused ?? undefined,
        pause_after_trial: config.pauseAfterTrial ?? undefined,
        sync_frequency: config.syncFrequency ?? undefined,
        daily_sync_time: config.dailySyncTime ?? undefined,
        schedule_type: config.scheduleType ?? undefined,
      };

      if (config.connectCardConfig !== undefined) {
        payload.connect_card_config = {
          redirect_uri: config.connectCardConfig.redirectUri,
          hide_setup_guide: config.connectCardConfig.hideSetupGuide,
        };
      }

      const response = await axiosInstance.post("/connections", payload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-list-connections": {
    config: {
      title: "List Connections",
      description: "Get all Fivetran connectors",
      inputSchema: {
        groupId: z.string().optional().describe("Filter by group ID"),
        limit: z.number().optional().describe("Maximum number of results"),
        cursor: z.string().optional().describe("Pagination cursor"),
      },
    },
    handler: async ({ groupId, limit, cursor }: any) => {
      const params = new URLSearchParams();
      if (groupId) params.append("group_id", groupId);
      if (limit) params.append("limit", limit.toString());
      if (cursor) params.append("cursor", cursor);

      const url = params.toString()
        ? `/connections?${params.toString()}`
        : `/connections`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-get-connection-details": {
    config: {
      title: "Get Connection Details",
      description: "Retrieve details of a specific Fivetran connector",
      inputSchema: {
        connectionId: z.string().describe("The connector ID"),
      },
    },
    handler: async ({ connectionId }: any) => {
      const response = await axiosInstance.get(`/connections/${connectionId}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-get-connection-state": {
    config: {
      title: "Get Connection State",
      description: "Retrieve the current state of a Fivetran connector",
      inputSchema: {
        connectionId: z.string().describe("The connector ID"),
      },
    },
    handler: async ({ connectionId }: any) => {
      const response = await axiosInstance.get(
        `/connections/${connectionId}/state`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-modify-connection": {
    config: {
      title: "Modify Connection",
      description: "Update a Fivetran connector configuration",
      inputSchema: {
        connectionId: z.string().describe("The connector ID"),
        paused: z
          .boolean()
          .optional()
          .describe("Pause or unpause the connector"),
        syncFrequency: z.number().optional().describe("Minutes between syncs"),
        dailySyncTime: z
          .string()
          .optional()
          .describe("Daily sync time (HH:MM format)"),
        scheduleType: z
          .enum(["auto", "manual"])
          .optional()
          .describe("Sync schedule type"),
        runSetupTests: z.boolean().optional().describe("Run setup tests"),
        trustCertificates: z
          .boolean()
          .optional()
          .describe("Auto-trust certificates"),
        trustFingerprints: z
          .boolean()
          .optional()
          .describe("Auto-trust fingerprints"),
      },
    },
    handler: async ({ connectionId, ...config }: any) => {
      const payload: any = {
        paused: config.paused ?? undefined,
        sync_frequency: config.syncFrequency ?? undefined,
        daily_sync_time: config.dailySyncTime ?? undefined,
        schedule_type: config.scheduleType ?? undefined,
        run_setup_tests: config.runSetupTests ?? undefined,
        trust_certificates: config.trustCertificates ?? undefined,
        trust_fingerprints: config.trustFingerprints ?? undefined,
      };

      const response = await axiosInstance.patch(
        `/connections/${connectionId}`,
        payload
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-modify-connection-state": {
    config: {
      title: "Modify Connection State",
      description: "Update the state of a Fivetran connector (pause/resume)",
      inputSchema: {
        connectionId: z.string().describe("The connector ID"),
      },
    },
    handler: async ({ connectionId }: any) => {
      const response = await axiosInstance.patch(
        `/connections/${connectionId}/state`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ==================== DESTINATIONS ====================
  "fivetran-create-destination": {
    config: {
      title: "Create Destination",
      description: "Create a new destination in a Fivetran group",
      inputSchema: {
        groupId: z.string().describe("The group ID"),
        service: z
          .string()
          .describe(
            "Destination service type (e.g., 'snowflake', 'bigquery', 'redshift')"
          ),
      },
    },
    handler: async ({ groupId, service }: any) => {
      const payload: any = {
        group_id: groupId,
        service,
      };

      const response = await axiosInstance.post("/destinations", payload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-list-destinations": {
    config: {
      title: "List Destinations",
      description: "Get all destinations in the account",
      inputSchema: {
        limit: z.number().optional().describe("Maximum number of results"),
        cursor: z.string().optional().describe("Pagination cursor"),
      },
    },
    handler: async ({ limit, cursor }: any) => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (cursor) params.append("cursor", cursor);

      const url = params.toString()
        ? `/destinations?${params.toString()}`
        : `/destinations`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-get-destination-details": {
    config: {
      title: "Get Destination Details",
      description: "Retrieve details of a specific destination",
      inputSchema: {
        destinationId: z.string().describe("The destination ID"),
      },
    },
    handler: async ({ destinationId }: any) => {
      const response = await axiosInstance.get(
        `/destinations/${destinationId}`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-modify-destination": {
    config: {
      title: "Modify Destination",
      description: "Update a destination configuration",
      inputSchema: {
        destinationId: z.string().describe("The destination ID"),
      },
    },
    handler: async ({ destinationId }: any) => {
      const payload: any = {};

      const response = await axiosInstance.patch(
        `/destinations/${destinationId}`,
        payload
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ========== GROUPS ==========
  "fivetran-list-groups": {
    config: {
      title: "List Groups",
      description: "Get all groups in the account",
      inputSchema: {
        limit: z.number().optional().describe("Maximum number of results"),
        cursor: z.string().optional().describe("Pagination cursor"),
      },
    },
    handler: async ({ limit, cursor }: any) => {
      const params = [];
      if (limit) params.push(`limit=${limit}`);
      if (cursor) params.push(`cursor=${cursor}`);

      const url = params.length ? `/groups?${params.join("&")}` : `/groups`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-create-group": {
    config: {
      title: "Create Group",
      description: "Create a new Fivetran group",
      inputSchema: {
        name: z
          .string()
          .describe(
            "The group name. Exclude special characters like '-' or '@'"
          ),
      },
    },
    handler: async ({ name }: any) => {
      const response = await axiosInstance.post("/groups", { name });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-list-users-in-group": {
    config: {
      title: "List All Users in Group",
      description: "Get all users in a specific group",
      inputSchema: {
        groupId: z.string().describe("The group ID"),
        limit: z.number().optional().describe("Maximum number of results"),
        cursor: z.string().optional().describe("Pagination cursor"),
      },
    },
    handler: async ({ groupId, limit, cursor }: any) => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (cursor) params.append("cursor", cursor);

      const url = params.toString()
        ? `/groups/${groupId}/users?${params.toString()}`
        : `/groups/${groupId}/users`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-add-user-to-group": {
    config: {
      title: "Add User to Group",
      description: "Add a user to a Fivetran group with a specific role",
      inputSchema: {
        groupId: z.string().describe("The group ID"),
        email: z.string().describe("The user email"),
        role: z
          .string()
          .describe("User role in the group (e.g., 'Administrator', 'Owner')"),
      },
    },
    handler: async ({ groupId, email, role }: any) => {
      const response = await axiosInstance.post(`/groups/${groupId}/users`, {
        user_id: email,
        role,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-modify-group": {
    config: {
      title: "Modify Group",
      description: "Update a group's properties",
      inputSchema: {
        groupId: z.string().describe("The group ID"),
        name: z.string().optional().describe("New group name"),
      },
    },
    handler: async ({ groupId, name }: any) => {
      const payload: any = {};
      if (name) payload.name = name;

      const response = await axiosInstance.patch(`/groups/${groupId}`, payload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  // ========== USERS ==========
  "fivetran-list-all-users": {
    config: {
      title: "List All Users",
      description: "Get all users in the account",
      inputSchema: {},
    },
    handler: async () => {
      const url = `/users`;

      const response = await axiosInstance.get(url);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-get-user-details": {
    config: {
      title: "Get User Details",
      description: "Retrieve details of a specific user",
      inputSchema: {
        userId: z.string().describe("The user ID"),
      },
    },
    handler: async ({ userId }: any) => {
      const response = await axiosInstance.get(`/users/${userId}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-modify-user": {
    config: {
      title: "Modify User",
      description: "Update a user's properties",
      inputSchema: {
        userId: z.string().describe("The user ID"),
        givenName: z.string().optional().describe("User's first name"),
        familyName: z.string().optional().describe("User's last name"),
        phone: z.string().optional().describe("User's phone number"),
        picture: z.string().optional().describe("User's profile picture URL"),
        role: z.string().optional().describe("User's account role"),
      },
    },
    handler: async ({ userId, ...updates }: any) => {
      const payload: any = {};

      if (updates.givenName) payload.given_name = updates.givenName;
      if (updates.familyName) payload.family_name = updates.familyName;
      if (updates.phone) payload.phone = updates.phone;
      if (updates.picture) payload.picture = updates.picture;
      if (updates.role) payload.role = updates.role;

      const response = await axiosInstance.patch(`/users/${userId}`, payload);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-update-user-connection-membership": {
    config: {
      title: "Update User Membership in Connection",
      description: "Update a user's role in a specific connection",
      inputSchema: {
        userId: z.string().describe("The user ID"),
        connectionId: z.string().describe("The connection ID"),
        role: z.string().describe("User's role for this connection"),
      },
    },
    handler: async ({ userId, connectionId, role }: any) => {
      const response = await axiosInstance.patch(
        `/users/${userId}/connections/${connectionId}`,
        { role }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },

  "fivetran-update-user-group-membership": {
    config: {
      title: "Update User Membership in Group",
      description: "Update a user's role in a specific group",
      inputSchema: {
        userId: z.string().describe("The user ID"),
        groupId: z.string().describe("The group ID"),
        role: z.string().describe("User's role in this group"),
      },
    },
    handler: async ({ userId, groupId, role }: any) => {
      const response = await axiosInstance.patch(
        `/users/${userId}/groups/${groupId}`,
        { role }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    },
  },
};

export default tools;
