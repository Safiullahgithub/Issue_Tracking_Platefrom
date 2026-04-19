import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import IssueForm from '../components/issues/IssueForm';
import { PageSpinner } from '../components/ui';

export default function EditIssuePage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/issues/${id}`).then(r => {
      setIssue(r.data.issue);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit Issue</h2>
        <p className="text-sm text-gray-500 mt-1 font-mono">{issue?.issueId} · {issue?.title}</p>
      </div>
      <IssueForm issue={issue} />
    </div>
  );
}
