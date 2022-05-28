import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserGroupIcon } from "@heroicons/react/solid";
import { updateActiveGroup } from "../../../../reducers/groups/groupSlice";
import GroupSettings from "../GroupSettings/GroupSettings";
import { DotsVerticalIcon } from "@heroicons/react/outline";
import Tooltip from "@mui/material/Tooltip";

export default function GroupItem({
	groupId,
	groupName,
	groupOwner,
	members,
	groupIcon,
}) {
	const dispatch = useDispatch();
	const imageEnvPath = process.env.REACT_APP_PUBLIC_FOLDER;

	const [open, setOpen] = useState(false);
	const handleClickOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};
	const { activeGroupInfo } = useSelector((state) => state.conversations);
	const { user } = useSelector((state) => state.auth);

	const sendGroupInfo = {
		groupId,
		groupName,
		groupOwner,
		members,
	};
	const activeStyle =
		activeGroupInfo.groupId === groupId
			? "bg-sky-100 dark:bg-slate-800 border-l-sky-500 border-l-[3px] dark:border-l-sky-500 "
			: "border-l-[3px] border-l-gray-300 dark:border-l-gray-600 hover:border-l-gray-400 dark:hover:border-l-gray-400";

	const groupOwnerStyle =
		groupOwner === user._id
			? "text-sky-500 dark:text-sky-600"
			: "text-gray-500 dark:text-gray-600";

	return (
		<div
			onClick={() => {
				// Prevent rerendering by clicking the group that is already active
				if (groupId !== activeGroupInfo.groupId) {
					dispatch(updateActiveGroup(sendGroupInfo));
				}
			}}
			className={`flex items-center justify-between w-full h-16 px-3 gap-2 cursor-pointer
				${activeStyle}`}
		>
			<Tooltip placement="right" arrow describeChild title={groupName}>
				<div className="flex gap-4">
					{groupIcon !== "" ? (
						<div className="relative rounded-full overflow-hidden">
							<img
								src={`${imageEnvPath}${groupIcon}`}
								className="object-fill w-12 h-w-12"
								alt="Avatar"
								loading="lazy"
							/>
						</div>
					) : (
						<div className="rounded-full overflow-hidden">
							<UserGroupIcon className={`h-12 w-12 ${groupOwnerStyle}`} />
						</div>
					)}
					<div className="flex items-center max-w-[175px] gap-2 text-gray1 dark:text-white">
						<span className="overflow-ellipsis overflow-hidden whitespace-nowrap">
							{groupName}
						</span>
					</div>
				</div>
			</Tooltip>

			{groupOwner === user._id && activeGroupInfo.groupId === groupId && (
				<>
					<Tooltip placement="top" arrow describeChild title="Settings">
						<button onClick={handleClickOpen}>
							<DotsVerticalIcon
								className="w-8 h-8 text-gray-600 hover:text-gray-700 dark:text-gray-300 hover:dark:text-gray-400 
									p-1 rounded-full border-[1px] border-transparent active:border-gray-500 dark:active:border-white 
									hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
							/>
						</button>
					</Tooltip>
					<GroupSettings
						open={open}
						handleClose={handleClose}
						groupId={groupId}
						groupName={groupName}
						groupIcon={groupIcon}
					/>
				</>
			)}
		</div>
	);
}
