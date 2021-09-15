import { IActionResult } from '@etsoo/appscript';
import { CommonPage, TextFieldEx, VBox } from '@etsoo/react';
import { DomUtils } from '@etsoo/shared';
import { Button } from '@mui/material';
import { RouteComponentProps } from '@reach/router';
import { useFormik } from 'formik';
import React from 'react';
import { Helper } from '../../app/Helper';
import { SmartApp } from '../../app/SmartApp';
import Yup from '../../app/YupHelper';

/**
 * Validate password
 * errorMessage is one parameter, add any parameters you need
 * use function, not arrow function, in order to hold the this reference
 */
Yup.addMethod<Yup.StringSchema>(
  Yup.string,
  'validatePassword',
  function (errorMessage: string) {
    return this.test('validate-password', errorMessage, function (value) {
      const { path, createError } = this;

      return (
        (value != null && Helper.isValidPassword(value)) ||
        createError({ path, message: errorMessage })
      );
    });
  }
);

// Change password
// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
function ChangePassword(_props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Labels
  const labels = app.getLabels(
    'currentPasswordRequired',
    'passwordTip',
    'newPasswordRequired',
    'newPasswordTip',
    'repeatPasswordRequired',
    'passwordRepeatError',
    'passwordChangeSuccess',
    'currentPassword',
    'newPassword',
    'repeatPassword',
    'submit'
  );

  // Form validation schema
  const validationSchema = Yup.object({
    oldPassword: Yup.string().required(labels.currentPasswordRequired),
    password: Yup.string()
      .validatePassword(labels.passwordTip)
      .required(labels.newPasswordRequired)
      .notOneOf([Yup.ref('oldPassword')], labels.newPasswordTip),
    rePassword: Yup.string()
      .required(labels.repeatPasswordRequired)
      // oneOf([Yup.ref('newPassword'), null], "Passwords mush match") will fail
      // ref is not proper for reach validation, ref field value is not ready
      .oneOf([Yup.ref('password')], labels.passwordRepeatError)
  });

  // Formik
  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      password: '',
      rePassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Submit data
      const data = {
        oldPassword: values.oldPassword,
        password: values.password
      };

      var result = await app.api.put<IActionResult>(
        'User/ChangePassword',
        data
      );
      if (result == null) return;

      if (result.success) {
        // Tip and clear
        app.notifier.succeed(labels.passwordChangeSuccess, undefined, () => {
          // Sign out
          app.api
            .put<boolean>('User/Signout', undefined, {
              onError: (error) => {
                console.log(error);
                // Prevent further processing
                return false;
              }
            })
            .then((_result) => {
              // Clear
              app.userLogout();

              // Go to login page
              app.toLoginPage();
            });
        });
      } else {
        formik.setFieldError('oldPassword', result.title);
        DomUtils.setFocus('oldPassword');
      }
    }
  });

  React.useEffect(() => {
    // Page title
    app.setPageKey('changePassword');
  }, [app]);

  return (
    <CommonPage maxWidth="xs">
      <form
        onSubmit={(event) => {
          formik.handleSubmit(event);
          DomUtils.setFocus(formik.errors);
        }}
      >
        <VBox spacing={2}>
          <TextFieldEx
            name="oldPassword"
            label={labels.currentPassword}
            showPassword={true}
            autoFocus
            value={formik.values.oldPassword}
            onChange={formik.handleChange}
            error={
              formik.touched.oldPassword && Boolean(formik.errors.oldPassword)
            }
            helperText={formik.touched.oldPassword && formik.errors.oldPassword}
          />
          <TextFieldEx
            name="password"
            label={labels.newPassword}
            showPassword={true}
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextFieldEx
            name="rePassword"
            label={labels.repeatPassword}
            showPassword={true}
            value={formik.values.rePassword}
            onChange={formik.handleChange}
            error={
              formik.touched.rePassword && Boolean(formik.errors.rePassword)
            }
            helperText={formik.touched.rePassword && formik.errors.rePassword}
          />
          <Button variant="contained" type="submit" fullWidth>
            {labels.submit}
          </Button>
        </VBox>
      </form>
    </CommonPage>
  );
}

export default ChangePassword;
