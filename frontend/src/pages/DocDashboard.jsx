import { Search, Plus, MoreVertical, User, FileText } from 'lucide-react';
import { NewDocument, RecentDocuments } from '../components/UI/index';
export default function DocDashboard(){

    const recentDocs = [
        { id: 1, name: 'Q4 Report', lastOpened: '2 days ago' },
        { id: 2, name: 'Project Plan', lastOpened: '3 days ago' },
        { id: 3, name: 'Meeting Notes', lastOpened: '1 week ago' },
        { id: 4, name: 'Budget 2024', lastOpened: '2 weeks ago' },
        { id: 5, name: 'Q4 Report', lastOpened: '2 days ago' },
        { id: 20, name: 'Project Plan', lastOpened: '3 days ago' },
        { id: 37, name: 'Meeting Notes', lastOpened: '1 week ago' },
        { id: 49, name: 'Budget 2024', lastOpened: '2 weeks ago' },
        { id: 81, name: 'Q4 Report', lastOpened: '2 days ago' },
        { id: 27, name: 'Project Plan', lastOpened: '3 days ago' },
        { id: 13, name: 'Meeting Notes', lastOpened: '1 week ago' },
        { id: 94, name: 'Budget 2024', lastOpened: '2 weeks ago' },
        { id: 91, name: 'Q4 Report', lastOpened: '2 days ago' },
        { id: 9882, name: 'Project Plan', lastOpened: '3 days ago' },
        { id: 983, name: 'Meeting Notes', lastOpened: '1 week ago' },
        { id: 984, name: 'Budget 2024', lastOpened: '2 weeks ago' },
        { id: 991, name: 'Q4 Report', lastOpened: '2 days ago' },
        { id: 982, name: 'Project Plan', lastOpened: '3 days ago' },
        { id: 993, name: 'Meeting Notes', lastOpened: '1 week ago' },
        { id: 9094, name: 'Budget 2024', lastOpened: '2 weeks ago' }
      ];

    return (
      <div className="max-w-[1400px] pt-20 mx-auto px-4 md:px-6 py-8">
        <NewDocument />
        <RecentDocuments recentDocs={recentDocs}/>
      </div>
    )
};