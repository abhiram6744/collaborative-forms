import React from 'react';
import { Users, Crown } from 'lucide-react';
import './ActiveUsers.css';

const ActiveUsers = ({ users, currentUser }) => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];

    const getUserColor = (userId) => {
        const index = parseInt(userId.slice(-2), 16) % colors.length;
        return colors[index];
    };

    return (



        Active Users({ users.length + 1 })



    {/* Current user */ }


    { currentUser.username.charAt(0).toUpperCase() }

    {
        currentUser.role === 'admin' && (
            
          )
    }


    {/* Other users */ }
    {
        users.map(user => (


            { user.username.charAt(0).toUpperCase() }
            
            {
                user.role === 'admin' && (
              
            )
            }

        ))
    }
      
    
  );
};

export default ActiveUsers;