import { Navigate, useLocation, useParams } from 'react-router-dom';
import { postPath } from '../utils/postLinks';
import NotFoundPage from './NotFoundPage';

// /blog/<slug> → /blog/<category>/<slug>.
//
// `/blog/<slug>` is the authoring form for links between posts and the short
// form for citing a post anywhere. It also catches the HashRouter-era
// `/#/blog/<slug>` links (public/index.html rewrites them to this path), so
// old external backlinks keep landing on the right post.
export default function PostRedirectPage() {
  const { slug } = useParams();
  const { hash } = useLocation();
  const target = postPath(slug);
  return target ? <Navigate to={target + hash} replace /> : <NotFoundPage />;
}
