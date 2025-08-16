const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Callable function to set admin by email. Only callable by existing admin or super admin.
exports.setAdminByEmail = functions.https.onCall(async (data, context) => {
  if(!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required.');
  }

  const superAdmin = (functions.config().roles || {}).super_admin_email || '';
  const callerEmail = (context.auth.token.email || '').toLowerCase();
  const callerIsAdmin = !!context.auth.token.admin;
  const callerIsSuper = callerEmail === (superAdmin || '').toLowerCase();

  if(!callerIsAdmin && !callerIsSuper) {
    throw new functions.https.HttpsError('permission-denied', 'Caller not allowed.');
  }

  const targetEmail = (data && data.email || '').trim().toLowerCase();
  if(!targetEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter "email" is required.');
  }

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    await admin.firestore().collection('admins').doc(user.uid).set({
      email: user.email,
      setAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { ok: true, message: `Admin set for ${targetEmail}` };
  } catch (err) {
    throw new functions.https.HttpsError('unknown', err.message || 'Failed');
  }
});
