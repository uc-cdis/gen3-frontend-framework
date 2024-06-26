import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '../../lib/myDataLibary';
import { isArray } from 'lodash';
import { JSONObject, isJSONObject } from '@gen3/core';
import { nanoid } from '@reduxjs/toolkit';

const deleteAll = async (res: NextApiResponse) => {
  await database.delete('/');
  res.status(200).json({ message: 'all lists deleted' });
};

const deleteList = async (id: string, res: NextApiResponse) => {
  try {
    await database.delete(`/${id}`);
    res.status(200).json({ message: `${id} deleted` });
  } catch (error: unknown) {
    res.status(401).json({ error: `cannot find list with id: ${id}` });
  }
};

const addList = async (id: string, body: JSONObject, res: NextApiResponse) => {
  const timestamp = new Date().toJSON();
  try {
    await database.push(
      `/${id}`,
      {
        version: 0,
        items: body,
        creator: '{{subject_id}}',
        authz: {
          version: 0,
          authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
        },
        created_time: timestamp,
        updated_time: timestamp,
      },
      true,
    );
    res.status(200).json({ message: `${id} added` });
  } catch (error: unknown) {
    res.status(500).json({ error: `error adding list: ${id}` });
  }
};

const updateList = async (
  id: string,
  body: JSONObject,
  res: NextApiResponse,
  override = true,
) => {
  try {
    const listData = await database.getData(`/${id}`);
    const timestamp = new Date().toJSON();
    const updated = {
      ...listData,
      version: listData?.version + 1 ?? 0,
      updated_time: timestamp,
      ...body,
    };
    await database.push(`/${id}`, updated, override);
    res.status(200).json({ message: `${id} added` });
  } catch (error: unknown) {
    res.status(500).json({ error: `error adding list: ${id}` });
  }
};

const addAllList = async (body: JSONObject, res: NextApiResponse) => {
  if (!Object.keys(body).includes('lists') || !isArray(body['lists'])) {
    res.status(500).json({ error: 'lists not found in request' });
    return;
  }
  const timestamp = new Date().toJSON();
  const allLists = body['lists'].reduce((acc: JSONObject, x: unknown) => {
    if (!isJSONObject(x)) return acc;

    const id = nanoid(10);
    acc[id] = {
      ...(x as JSONObject),
      version: 0,
      created_time: timestamp,
      updated_time: timestamp,
      creator: '{{subject_id}}',
      authz: {
        version: 0,
        authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
      },
    };
    return acc;
  }, {} as JSONObject);

  try {
    await database.push('/', allLists, true);
    res.status(200).json({ message: 'all lists added' });
  } catch (error: unknown) {
    res.status(500).json({ error: 'error adding all lists' });
  }
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } =
    isArray(req.query) && req.query.length === 1 ? req.query[0] : undefined;

  if (req.method === 'GET') {
    let lists = undefined;
    if (id) {
      try {
        lists = await database.getData(`/${id}`);
        res.status(200).json({ lists });
      } catch (error: unknown) {
        res.status(401).json({ error: `cannot find list with id: ${id}` });
      }
    } else {
      lists = await database.getData('/');
      if (lists) {
        res.status(200).json({ lists });
      } else {
        res.status(500).json({ error: 'issue with the database' });
      }
    }
  } else if (req.method === 'DELETE') {
    // deleting a single list
    if (id) {
      if (typeof id === 'string') await deleteList(id, res);
      if (isArray(id)) {
        id.forEach((x) => deleteList(x, res));
      }
    } else {
      // delete everything
      await deleteAll(res);
    }
  } else if (req.method === 'POST') {
    console.log('id', id);
    if (id) {
      await addList(id, req.body, res);
    } else {
      await addAllList(req.body, res);
    }
  } else if (req.method === 'UPDATE') {
    // no support for UPDATE all
    if (id) {
      await updateList(id, req.body, res);
    } else {
      await addAllList(req.body, res);
    }
  }
}
