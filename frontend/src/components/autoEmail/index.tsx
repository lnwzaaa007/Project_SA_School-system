import React from 'react';
import { AutoComplete } from 'antd';
import type { AutoCompleteProps } from 'antd';

const autoEmail: React.FC = () => {
  const [options, setOptions] = React.useState<AutoCompleteProps['options']>([]);
  const handleSearch = (value: string) => {
    setOptions(() => {
      if (!value || value.includes('@')) {
        return [];
      }
      return ['gmail.com', 'hotmail.com', ].map((domain) => ({
        label: `${value}@${domain}`,
        value: `${value}@${domain}`,
      }));
    });
  };
  return (
    <AutoComplete
      style={{ width: 200 }}
      onSearch={handleSearch}
      placeholder="input here"
      options={options}
    />
  );
};

export default autoEmail;