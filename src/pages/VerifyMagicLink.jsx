import { useEffect } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSetAtom } from 'jotai';

import useAuth from '@/hooks/useAuth';
import { showOverlayLoadingAtom } from '@/config/state';

function VerifymagicLink() {
  const [searchParams] = useSearchParams();
  const { verifyMagicToken } = useAuth();
  const navigate = useNavigate();
  const setOverlayLoading = useSetAtom(showOverlayLoadingAtom);

  useEffect(() => {
    const token = searchParams.get("token");
    if(! token) return navigate("/");

    verify(token);
  }, []);

  async function verify(token) {
    setOverlayLoading(true);

    await verifyMagicToken(token);
    setOverlayLoading(false);

    navigate("/");
  }

  return null;
}

export default VerifymagicLink;
