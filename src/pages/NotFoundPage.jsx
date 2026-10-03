import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="empty-state">
      <div className="not-found-art" aria-hidden="true">?</div>
      <h2>This Pokémon wandered off!</h2>
      <p>The page you were looking for could not be found.</p>
      <Link to="/" className="primary-link">Back to Pokédex</Link>
    </div>
  );
}

export default NotFoundPage;
