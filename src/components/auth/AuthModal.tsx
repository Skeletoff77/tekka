import React from 'react';
import { Modal } from '../common/Modal';
import { LoginView } from './LoginView';
import { SignUpView } from './SignUpView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, setAuthModalMode } = useAuth();

  const getTitle = () => {
    switch (authModalMode) {
      case 'signup':
        return 'Create Tekka Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'login':
      default:
        return 'Log In to Tekka';
    }
  };

  const getSubtitle = () => {
    switch (authModalMode) {
      case 'signup':
        return 'Join the next era of digital tabletop & strategy gaming.';
      case 'forgot-password':
        return 'Recover access to your gamer identity & tracked titles.';
      case 'login':
      default:
        return 'Access your game library, profile and beta invites.';
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      title={getTitle()}
      subtitle={getSubtitle()}
      maxWidth="md"
    >
      {authModalMode === 'login' && (
        <LoginView
          onSwitchToSignUp={() => setAuthModalMode('signup')}
          onSwitchToForgotPassword={() => setAuthModalMode('forgot-password')}
        />
      )}
      {authModalMode === 'signup' && (
        <SignUpView onSwitchToLogin={() => setAuthModalMode('login')} />
      )}
      {authModalMode === 'forgot-password' && (
        <ForgotPasswordView onBackToLogin={() => setAuthModalMode('login')} />
      )}
    </Modal>
  );
};
