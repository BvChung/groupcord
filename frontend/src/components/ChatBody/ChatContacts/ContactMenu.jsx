import { useState, useEffect, useCallback, useContext } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector, useDispatch } from "react-redux";
import {
	createChatGroups,
	resetState,
} from "../../../features/conversations/conversationSlice";
import { SocketContext } from "../../../appContext/socketContext";
import { toast } from "react-toastify";

export default function ContactMenu({ open, handleClose }) {
	const socket = useContext(SocketContext);
	const dispatch = useDispatch();

	const { user } = useSelector((state) => state.auth);
	const auth = useSelector((state) => state.auth);
	const { updateError, message, isSuccess } = useSelector(
		(state) => state.auth
	);
	const { sendGroupToSocket } = useSelector((state) => state.conversations);
	// console.log(sendGroupToSocket);
	const { groups } = useSelector((state) => state.conversations);
	// console.log(groups);

	// console.log(user);
	// console.log(auth);

	const [formData, setFormData] = useState({
		groupName: "",
	});

	// console.log(formData);

	function handleFormData(e) {
		const { name, value } = e.target;

		setFormData((prevData) => {
			return {
				...prevData,
				[name]: value,
			};
		});
	}

	function handleSubmit(e) {
		e.preventDefault();

		if (formData.groupName === "") return;

		dispatch(createChatGroups(formData));

		handleClose();
	}

	// const sendGroup = useCallback(
	// 	(groupData) => {
	// 		socket.emit("send_group", groupData);
	// 	},
	// 	[socket]
	// );

	// useEffect(() => {
	// 	sendGroup();
	// }, [sendGroupToSocket]);

	// useEffect(() => {
	// 	if (Object.keys(sendGroupToSocket).length !== 0) {
	// 		// console.log("send to socket");
	// 		sendGroup(sendGroupToSocket);
	// 	}
	// }, [sendGroupToSocket]);

	function resetFormData() {
		setFormData((prevData) => {
			return {
				...prevData,
				groupName: "",
			};
		});
	}

	// const displayError = useCallback(() => {
	// 	if (updateError) {
	// 		toast.error(message);
	// 	}
	// }, [message, updateError]);

	// const displaySuccess = useCallback(() => {
	// 	if (isSuccess) {
	// 		toast.success("Your account has been updated");

	// 		resetFormData();
	// 	}
	// }, [isSuccess]);

	// const resetAfterUpdate = useCallback(() => {
	// 	dispatch(resetState());
	// }, [dispatch]);

	// useEffect(() => {
	// 	displaySuccess();
	// 	displayError();

	// 	return () => {
	// 		resetAfterUpdate();
	// 	};
	// }, [displaySuccess, displayError, resetAfterUpdate]);

	return (
		<>
			<Dialog
				open={open}
				onClose={() => {
					handleClose();
					resetFormData();
				}}
			>
				<div className="w-96 p-6 bg-gray-100">
					<div className="text-center text-xl font-semibold">
						Create Conversation
					</div>

					<TextField
						name="groupName"
						value={formData.groupName}
						onChange={handleFormData}
						margin="dense"
						id="groupName"
						label="Group name"
						type="text"
						fullWidth
						variant="standard"
					/>
					{/* <TextField
						name="invitedUser"
						value={formData.invitedUser}
						onChange={handleFormData}
						margin="dense"
						id="invitedUser"
						label="Receiver Name"
						type="text"
						fullWidth
						variant="standard"
					/> */}

					<DialogActions>
						<Button
							onClick={() => {
								handleClose();
								resetFormData();
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={(e) => {
								handleSubmit(e);
							}}
						>
							Save
						</Button>
					</DialogActions>
				</div>
			</Dialog>
		</>
	);
}
