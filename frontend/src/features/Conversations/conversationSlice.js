import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import conversationService from "./conversationService";
import {
	filterMembers,
	removeDuplicateData,
	errorMessage,
	updateGroup,
	updateMembersGroups,
	updateGroupName,
	deleteData,
} from "../helperFunc/helperFunctions";

const initialState = {
	registeredMembers: {},
	groups: {},
	groupInfo: {
		groupId: "Global",
		groupOwner: "",
		members: [],
	},
	filteredMembers: [],
	memberUpdatedToSocket: {},
	groupDeletedToSocket: {},
	groupNameUpdatedToSocket: {},
	isLoading: false,
	isSuccess: false,
	loadInitialGroups: false,
	isError: false,
};

export const createChatGroups = createAsyncThunk(
	"group/create",
	async (groupData, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			return await conversationService.createGroup(groupData, token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const getChatGroups = createAsyncThunk(
	"group/get",
	async (_, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			return await conversationService.getGroup(token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const updateChatGroupName = createAsyncThunk(
	"group/updateGroupName",
	async (groupData, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			const { groupId, groupName } = groupData;
			return await conversationService.updateGroup(groupId, groupName, token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const deleteChatGroup = createAsyncThunk(
	"group/delete",
	async (groupId, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			return await conversationService.deleteGroup(groupId, token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const getRegisteredMembers = createAsyncThunk(
	"group/getMembers",
	async (_, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			return await conversationService.getMembers(token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const addGroupMembers = createAsyncThunk(
	"group/addMembers",
	async (memberId, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			const { groupId } = thunkAPI.getState().conversations.groupInfo;
			return await conversationService.addMembers(memberId, groupId, token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

export const removeGroupMembers = createAsyncThunk(
	"group/removeMembers",
	async (memberId, thunkAPI) => {
		try {
			const token = thunkAPI.getState().auth.user.token;
			const { groupId } = thunkAPI.getState().conversations.groupInfo;
			return await conversationService.removeMembers(memberId, groupId, token);
		} catch (error) {
			return thunkAPI.rejectWithValue(errorMessage(error));
		}
	}
);

// return {
// 	registeredMembers: {},
// 	groups: {},
// 	groupInfo: {
// 		groupId: "Global",
// 		groupOwner: "",
// 		members: [],
// 	},
// 	filteredMembers: [],
// 	memberUpdatedToSocket: {},
// 	groupDeletedToSocket: {},
// 	groupNameUpdatedToSocket: {},
// 	isLoading: false,
// 	isSuccess: false,
// 	loadInitialGroups: false,
// 	isError: false,
// };
export const groupSlice = createSlice({
	name: "chatGroup",
	initialState,
	reducers: {
		resetGroupState: (state) => initialState,
		updateActiveGroup: (state, action) => {
			state.groupInfo = action.payload;
			state.filteredMembers = filterMembers(
				state.registeredMembers,
				state.groupInfo.members
			);
		},
		leaveGroup: (state, action) => {
			state.groups = deleteData(state.groups, action.payload);
		},
		socketDataUpdateMembers: (state, action) => {
			state.groupInfo.members = action.payload.groupData.members;
			state.filteredMembers = action.payload.filteredMembers;
		},
		socketDataUpdateGroups: (state, action) => {
			state.groups = updateMembersGroups(state.groups, action.payload);
			state.groups = removeDuplicateData(state.groups);
		},
		socketDataUpdateGroupName: (state, action) => {
			state.groups = updateGroupName(state.groups, action.payload);
		},
		socketDataDeleteGroup: (state, action) => {
			state.groups = deleteData(state.groups, action.payload);
		},
	},
	extraReducers: (builder) => {
		builder.addCase(createChatGroups.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(createChatGroups.fulfilled, (state, action) => {
			state.isLoading = false;
			state.isSuccess = true;
			state.groups.push(action.payload);
			// state.sendGroupToSocket = action.payload;
		});
		builder.addCase(createChatGroups.rejected, (state) => {
			state.isLoading = false;
			state.isError = true;
		});
		builder.addCase(getChatGroups.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getChatGroups.fulfilled, (state, action) => {
			state.isLoading = false;
			state.loadInitialGroups = true;
			state.groups = action.payload.userConversations;
		});
		builder.addCase(getChatGroups.rejected, (state) => {
			state.isLoading = false;
			state.isError = true;
		});
		builder.addCase(deleteChatGroup.fulfilled, (state, action) => {
			console.log(action.payload);
			state.groups = action.payload.allGroups;
			state.groupDeletedToSocket = action.payload.deletedGroup;
		});
		builder.addCase(addGroupMembers.fulfilled, (state, action) => {
			state.isSuccess = true;
			state.groupInfo.members = action.payload.updatedMembers.members;
			state.filteredMembers = filterMembers(
				state.registeredMembers,
				state.groupInfo.members
			);

			state.memberUpdatedToSocket = {
				groupData: action.payload.updatedMembers,
				memberChanged: action.payload.memberChanged,
				action: "addMember",
			};

			// Update users groups when group owner adds member
			const currentGroupInfoState = current(state.groupInfo);
			state.groups = updateGroup(
				state.groups,
				currentGroupInfoState,
				action.payload.updatedMembers
			);
		});
		builder.addCase(removeGroupMembers.fulfilled, (state, action) => {
			state.isSuccess = true;
			state.groupInfo.members = action.payload.updatedMembers.members;

			state.filteredMembers = filterMembers(
				state.registeredMembers,
				state.groupInfo.members
			);

			state.memberUpdatedToSocket = {
				groupData: action.payload.updatedMembers,
				memberChanged: action.payload.memberChanged,
				filteredMembers: [
					...state.filteredMembers,
					action.payload.memberChanged,
				],
				action: "removeMember",
			};

			// Update users groups when group owner adds member
			const currentGroupInfoState = current(state.groupInfo);
			state.groups = updateGroup(
				state.groups,
				currentGroupInfoState,
				action.payload.updatedMembers
			);
		});
		builder.addCase(getRegisteredMembers.fulfilled, (state, action) => {
			state.registeredMembers = action.payload;
		});
		builder.addCase(updateChatGroupName.fulfilled, (state, action) => {
			state.groups = action.payload.allGroups;
			state.groupNameUpdatedToSocket = action.payload.updatedGroupName;
		});
	},
});

export const {
	resetGroupState,
	leaveGroup,
	socketDataUpdateMembers,
	updateActiveGroup,
	socketDataUpdateGroups,
	socketDataUpdateGroupName,
	socketDataDeleteGroup,
} = groupSlice.actions;
export default groupSlice.reducer;
