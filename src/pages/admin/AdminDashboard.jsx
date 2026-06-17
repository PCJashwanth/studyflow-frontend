import { useState } from "react";

const navItems = ['Users','Course', 'Audit log', 'Settings']

{/* hardcoded users for display */}
const users = [
  {
    id: 1,
    fullName: "Maya Thompson",
    email: "maya.t@dal.ca",
    role: "Student",
    isActive: true,
  },
  {
    id: 2,
    fullName: "Dr. Okafor",
    email: "d.okafor@dal.ca",
    role: "Instructor",
    isActive: true,
  },
  {
    id: 3,
    fullName: "Emma Wilson",
    email: "emma.wilson@dal.ca",
    role: "Student",
    isActive: false,
  },
];

function AdminDashboard({ onLogout }) {
    const [activePage, setActivePage] = useState('Users')
    const [showPopup, setShowPopup] = useState(false)

    return (

        <div className="dashboard">

            {/* sidebar nav 
            TODO: move sidebar into components folder as a reusable component */}
            <aside className="sidebar admin">

                <div className="sidebar-logo">
                    <span>StudyFlow</span>
                </div>   

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item}
                            className={`nav-item ${activePage === item ? 'active' : ''}`}
                            onClick={() => setActivePage(item)}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                {/* profile at the bottom of the sidebar */}
                <div className="sidebar-bottom">

                    {/* the profile popup menu */}
                    {showPopup && (
                        <div className="profile-popup">
                            <button className="popup-item" onClick={() => setShowPopup(false)}>Profile</button>
                            <button className="popup-item" onClick={() => setShowPopup(false)}>Settings</button>
                            <hr className="popup-divider" />
                            <button className="popup-item danger" onClick={onLogout}>Sign out</button>
                        </div>
                    )}

                    <div className="sidebar-user" onClick={() => setShowPopup(!showPopup)}>
                        <div className="user-avatar">AD</div>
                        <div>
                            <p className="user-name">Admin</p>
                            <p className="user-role">Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* main content for user management */}
            <main className="main-area" onClick={() => setShowPopup(false)}>

                <p className="greeting">User Management</p>
                <p className="greeting-sub">Manage users, roles, and account status</p>


                <div className="panel admin-panel">
                    <div className="admin-toolbar">
                        <input
                        type="text"
                        placeholder="Search users..."
                        className="user-search"
                        />

                        <button className="add-user-btn">
                            + Add User
                        </button>
                    </div>

                    {/* display users */}
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="table-user">
                                            <div className="table-avatar">
                                                {user.fullName.split(" ").map((word) => word[0]).join("")}
                                            </div>

                                            <span>{user.fullName}</span>
                                        </div>
                                    </td>

                                    <td>{user.email}</td>

                                    <td>
                                        <select className="role-select" defaultValue={user.role}>
                                            <option>Student</option>
                                            <option>Instructor</option>
                                        </select>
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${ user.isActive ? "active" : "inactive" }`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <button className="table-action">
                                            Edit
                                        </button>

                                        <button className="table-action danger">
                                            {user.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

        </div>

    )
}

export default AdminDashboard