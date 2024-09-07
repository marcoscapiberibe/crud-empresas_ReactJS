import React, { useState } from 'react';
import CompanyTable from './components/CompanyTable';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsLoggedIn(true); // Atualiza o estado do usuário como logado
  };

  return (
    <div className="App">
      {isLoggedIn ? <CompanyTable /> : <Login onLogin={handleLogin} />}
    </div>
  );
};

export default App;