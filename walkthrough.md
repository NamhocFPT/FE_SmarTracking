# Walkthrough of Changes

Improved styling, layout structure, and overflow robustness for the invited participant cards, added the new **Quản lý lịch họp** (Meeting Approvals) management page for managers, and added a dedicated **Đổi ảnh đại diện** modal on the user Profile page.

## Changes Made

### 1. Invited Participant Card Sizing & Aesthetics (`BookMeeting.jsx`)
- **Floating Autocomplete Suggestions Dropdown:**
  - **Cohesive Aesthetics:** Added mini-avatars to autocomplete items inside the suggestion list to mirror the final selected list's design.
  - **Responsive Truncation:** Wrapped content with `min-w-0` and `flex-1` flex behaviors. Used the `truncate` class on the name, email, and department tags to keep the layout aligned. Added hover `title` tooltips displaying full texts.
- **Selected Internal Participant Card:**
  - **Premium Design:** Swapped the card's sharp edges with soft rounded corners (`rounded-2xl`), a premium subtle border (`border-action-blue/20`), and a light blue background tint (`bg-action-blue/[0.02]`). Added a subtle hover shadow (`hover:shadow`) and smooth transitions (`duration-200`).
  - **Robust Flex Boundaries:** Added `min-w-0 flex-1` on the text section and `truncate` on text layers (name, email, department tag) to ensure the grid columns handle long Vietnamese names and corporate emails without stretching the grid or throwing off button alignments.
  - **Hover Action Guides:** Added a sleek translucent `Info` icon overlay onto the user's avatar on hover, visually prompting users that clicking the avatar triggers the public profile detail popup, while clicking the card body deselects/deletes them.
  - **Interactive Transitions:** Polished the select checkmark transition into a red deletion cross (`bg-rose-600`) upon hovering anywhere on the card.
- **External Participant Pills:**
  - **Pill Alignment:** Styled the external guest email pills with a strict maximum width (`max-w-[150px] sm:max-w-[200px] truncate`) to wrap lengthy guest email domains cleanly and avoid horizontal layout blowouts.

### 2. Manager Meeting Approvals & Schedule Management
- **New Management Page (`MeetingApprovals.jsx`):**
  - **Comprehensive Dashboard:** Created a new page `src/pages/manager/MeetingApprovals.jsx` displaying the detailed list of all meeting requests.
  - **Advanced Filters:** Added query keyword search, date from/to filters, and status tabs ("Chờ phê duyệt", "Đã phê duyệt", "Đã từ chối", "Tất cả") to easily navigate requests.
  - **Pagination Controls:** Implemented clean client-side pagination UI controls (Previous Page, Page Indicator, Next Page) supporting up to 10 items per page.
  - **Detailed Drawer/Modal:** Clicking the eye icon opens a rich details view containing complete requester details, meeting context, room capabilities, conflict check statuses, and past approval notes.
- **Homepage Integration (`homePage.jsx`):**
  - **Homepage Slicing:** Modified the homepage pending requests table to display only the top 5 most recent pending requests.
  - **Detail Redirection Links:** Added a "Quản lý chi tiết" button in the table header, and a card footer link reading "Xem và xử lý thêm X yêu cầu khác", both navigating directly to `/manager/meeting-approvals`.
- **Navbar & Routing Registration:**
  - **Navbar Link:** Updated `src/pages/manager/layout/ManagerLayout.jsx` to display the "Quản lý lịch họp" option between the Homepage and Calendar pages.
  - **Route Mapping:** Registered the new manager component in `src/routers/index.js` under the `/manager/meeting-approvals` route.

### 3. Dedicated Avatar Upload Modal (`Profile.jsx`)
- **Visual Button Trigger:** Added a beautiful camera icon button labeled **"Đổi ảnh đại diện"** under the profile image on the left sidebar.
- **Hover Action overlay:** Restored and polished the overlay showing **"Đổi ảnh"** when the cursor hovers directly over the profile picture itself.
- **Independent Flow:** Separated the avatar submission from the text field editor. Clicking either the button or the overlay now opens a clean pop-up modal containing the `AvatarUploadForm`, keeping the avatar image visible at all times and preventing confusion when editing standard profile fields.
- **Auto-Close:** Configured the modal to automatically close upon a successful upload request.

## Verification
- Checked that all components compile correctly and react to routing transitions.
- All code styles are consistent with the existing SmarTracking UI system (Tailwind colors, Framer motion animations, and Lucide icons).
