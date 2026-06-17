import { useState } from "react";

const navItems = ['Users','Course', 'Audit log', 'Settings']

function AdminDashboard({ onLogout }) {
    const [activePage, setActivePage] = useState('Users')
    const [showPopup, setShowPopup] = useState(false)

    return (

        <div className="dashboard">

            {/* sidebar nav */}
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
                            <p className="user-role">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            


        </div>

    )
}

export default AdminDashboard