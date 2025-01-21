import React from 'react';
import {FlatList} from 'react-native';
import List from './MainList';

export default function VideosList() {
  const thumbnail =
    'https://imgs.search.brave.com/pEOlTyNSkZpXVfHbHSkWDjjNE7GTxXKFM0GsNUZinQY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM2/OTE5OTM2MC9waG90/by9wb3J0cmFpdC1v/Zi1hLWhhbmRzb21l/LXlvdW5nLWJ1c2lu/ZXNzbWFuLXdvcmtp/bmctaW4tb2ZmaWNl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz11anlHZHU4aktJ/MlVCNTUxNVhaQTMz/VHQ0REJoRFUxOWRL/U1RVVE1adnJnPQ';
  const persons = [
    {
      id: 1,
      name: 'Himanshu',
      title: 'title Videodasdasdasdasdasdasdasdasdasd',
      thumbnail,
    },
    {id: 2, name: 'Aman', title: 'title Video', thumbnail},
    {id: 3, name: 'Aman', title: 'title Video', thumbnail},
    {id: 4, name: 'Aman', title: 'title Video', thumbnail},
    {id: 5, name: 'Aman', title: 'title Video', thumbnail},
    {id: 6, name: 'Aman', title: 'title Video', thumbnail},
  ];
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={persons}
      renderItem={({item}) => <List item={item} />}
    />
  );
}
