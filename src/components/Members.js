import React from 'react';
import '../App.css';

export default function Members({members, me, room}) {
  return (
    <div className="members">
      <div className="membersCount">
        {members.length} gracz{members.length === 1 ? '' : 'y'} w pokoju {room}
      </div>
      <div className="membersList">
        {members.map(m => Member(m, m.id === me.id))}
      </div>
    </div>);
}

function Member({id, clientData}, isMe) {
  const {username, color} = clientData;
  return (
    <div key={id} className="member">
      <div className="avatar" style={{backgroundColor: color}}/>
      <div className="username">{username} {isMe ? ' (ty)' : ''}</div>
    </div>
  );
}