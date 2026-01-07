import Container from '../components/Container';
import Button from '../components/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Button text="New Tournament" onClick={() => navigate('/create')} />
    </Container>
  );
};

export default Home;
