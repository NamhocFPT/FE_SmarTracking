import ToastContainer from "./components/common/ToastContainer";
import AllRouter from "./routers/AllRouter";

// Handle auth expiry globally — full reload to /login clears all stale state
window.addEventListener('auth-expired', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.replace('/login');
});

function App() {
  return (
    <>
      <AllRouter />
      <ToastContainer />
    </>
  );
}

export default App;
