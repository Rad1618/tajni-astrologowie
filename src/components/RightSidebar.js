import { useState } from 'react';
import HelpMeModal from '../modals/HelpMeModal';
import { Ambulance } from 'lucide-react';
import '../styles/sidebar.css';

export default function RightSidebar({gameState})
{
  const [helpOpen, setHelpOpen] = useState(false);

  return (
  <div className="sidebarContainer">
    <div className="sidebarTriggerContainer">
      <button className="sidebarTrigger" onClick={() => {setHelpOpen(true)}}>
        <Ambulance className='buttonIcon'/>
      </button>
      <div>SOR</div>
    </div>
    <HelpMeModal open={helpOpen} setOpen={setHelpOpen} gameState={gameState}/>
  </div>);
}