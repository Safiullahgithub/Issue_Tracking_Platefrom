import IssueForm from '../components/issues/IssueForm';

export default function CreateIssuePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Create New Issue</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to report a bug, vulnerability, or feature request.</p>
      </div>
      <IssueForm />
    </div>
  );
}
