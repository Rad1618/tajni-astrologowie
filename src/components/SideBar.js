import '../styles/sidebar.css';

export default function SideBar({me, switchAdmin})
{
  return (<div className="sidebarContainer">
    <div className="sidebarAdminContainer">
      <div className={(me?.admin ?? false) ? "sidebarAdminActive" : "sidebarAdmin"} onClick={switchAdmin}></div>
      <div>Admin</div>
    </div>
  </div>);
}