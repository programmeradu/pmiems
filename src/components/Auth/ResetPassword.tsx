import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
} from '@nextui-org/react';

interface ResetPasswordProps {
  onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [step, setStep] = useState<'request' | 'success'>("request");

  const initialValues = {
    username: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().required(t('validation.required')),
  });

  const handleSubmit = async (values: { username: string }, { setSubmitting }: any) => {
    setMessage(null);
    try {
      const result = await resetPassword(values.username);
      
      if (result.success) {
        setMessage({ 
          text: t('auth.resetPasswordSuccess'), 
          type: 'success' 
        });
        setStep('success');
      } else {
        setMessage({ 
          text: result.message || t('auth.resetPasswordFailed'), 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: t('errors.generic'), 
        type: 'error' 
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">
          {step === 'request' 
            ? t('auth.resetPassword') 
            : t('auth.resetPasswordSent')}
        </h2>
        <p className="text-default-500 text-sm">
          {step === 'request' 
            ? t('auth.resetPasswordInstructions') 
            : t('auth.resetPasswordCheckEmail')}
        </p>
      </CardHeader>
      
      <CardBody>
        {step === 'request' ? (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-4">
                <div>
                  <Field name="username">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        label={t('auth.username')}
                        variant="bordered"
                        fullWidth
                        isInvalid={touched.username && !!errors.username}
                        errorMessage={touched.username && errors.username}
                      />
                    )}
                  </Field>
                </div>
                
                {message && (
                  <div 
                    className={`text-${message.type === 'success' ? 'success' : 'danger'} text-center`}
                  >
                    {message.text}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  color="primary" 
                  fullWidth
                  isLoading={isSubmitting}
                >
                  {t('auth.sendResetLink')}
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-success">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <p>{t('auth.resetPasswordCheckEmail')}</p>
            <p className="text-sm text-default-500 mt-2">
              {t('auth.resetPasswordExpiry')}
            </p>
          </div>
        )}
      </CardBody>
      
      <CardFooter>
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="flat"
            onClick={onBack}
          >
            {step === 'request' ? t('common.cancel') : t('common.backToLogin')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResetPassword;