import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  changeGroupEditorTitle,
  changeGroupEditorDescription,
  changeGroupEditorMedia,
} from 'soapbox/actions/groups';
import { Avatar, Form, FormGroup, HStack, Icon, Input, Text, Textarea } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useDebounce, useInstance } from 'soapbox/hooks';
import { useGroupValidation } from 'soapbox/hooks/api';
import { isDefaultAvatar, isDefaultHeader } from 'soapbox/utils/accounts';
import resizeImage from 'soapbox/utils/resize-image';

import type { List as ImmutableList } from 'immutable';

interface IMediaInput {
  src: string | null
  accept: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled: boolean
}

const messages = defineMessages({
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
});

const HeaderPicker: React.FC<IMediaInput> = ({ src, onChange, accept, disabled }) => {
  return (
    <label
      className='dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-xl bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-44'
    >
      {src && <img className='h-full w-full object-cover' src={src} alt='' />}
      <HStack
        className={clsx('absolute top-0 h-full w-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-100 dark:bg-gray-800': src,
        })}
        space={1.5}
        alignItems='center'
        justifyContent='center'
      >
        <Icon
          src={require('@tabler/icons/photo-plus.svg')}
          className='h-4.5 w-4.5'
        />

        <Text size='md' theme='primary' weight='semibold'>
          <FormattedMessage id='group.upload_banner' defaultMessage='Upload photo' />
        </Text>

        <input
          name='header'
          type='file'
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className='hidden'
        />
      </HStack>
    </label>
  );
};

const AvatarPicker: React.FC<IMediaInput> = ({ src, onChange, accept, disabled }) => {
  return (
    <label className='absolute left-1/2 bottom-0 h-20 w-20 -translate-x-1/2 translate-y-1/2 cursor-pointer rounded-full bg-primary-500 ring-4 ring-white dark:ring-primary-900'>
      {src && <Avatar src={src} size={80} />}
      <HStack
        alignItems='center'
        justifyContent='center'

        className={clsx('absolute left-0 top-0 h-full w-full rounded-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-500': src,
        })}
      >
        <Icon
          src={require('@tabler/icons/camera-plus.svg')}
          className='h-5 w-5 text-white'
        />
      </HStack>
      <span className='sr-only'>Upload avatar</span>
      <input
        name='avatar'
        type='file'
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
};

const DetailsStep = () => {
  const intl = useIntl();
  const debounce = useDebounce;
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const groupId = useAppSelector((state) => state.group_editor.groupId);
  const isUploading = useAppSelector((state) => state.group_editor.isUploading);
  const name = useAppSelector((state) => state.group_editor.displayName);
  const description = useAppSelector((state) => state.group_editor.note);

  const debouncedName = debounce(name, 300);

  const { data: { isValid, message: errorMessage } } = useGroupValidation(debouncedName);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [headerSrc, setHeaderSrc] = useState<string | null>(null);

  const attachmentTypes = useAppSelector(
    state => state.instance.configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>,
  )?.filter(type => type.startsWith('image/')).toArray().join(',');

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeGroupEditorTitle(target.value));
  };

  const onChangeDescription: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    dispatch(changeGroupEditorDescription(target.value));
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const rawFile = e.target.files?.item(0);

    if (!rawFile) return;

    if (e.target.name === 'avatar') {
      resizeImage(rawFile, 400 * 400).then(file => {
        dispatch(changeGroupEditorMedia('avatar', file));
        setAvatarSrc(URL.createObjectURL(file));
      }).catch(console.error);
    } else {
      resizeImage(rawFile, 1920 * 1080).then(file => {
        dispatch(changeGroupEditorMedia('header', file));
        setHeaderSrc(URL.createObjectURL(file));
      }).catch(console.error);
    }
  };

  useEffect(() => {
    if (!groupId) return;

    dispatch((_, getState) => {
      const group = getState().groups.items.get(groupId);
      if (!group) return;
      if (group.avatar && !isDefaultAvatar(group.avatar)) setAvatarSrc(group.avatar);
      if (group.header && !isDefaultHeader(group.header)) setHeaderSrc(group.header);
    });
  }, [groupId]);

  return (
    <Form>
      <div className='relative mb-12 flex'>
        <HeaderPicker src={headerSrc} accept={attachmentTypes} onChange={handleFileChange} disabled={isUploading} />
        <AvatarPicker src={avatarSrc} accept={attachmentTypes} onChange={handleFileChange} disabled={isUploading} />
      </div>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name (required)' />}
        hintText={<FormattedMessage id='manage_group.fields.name_help' defaultMessage='This cannot be changed after the group is created.' />}
        errors={isValid ? [] : [errorMessage as string]}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
          value={name}
          onChange={onChangeName}
          maxLength={Number(instance.configuration.getIn(['groups', 'max_characters_name']))}
        />
      </FormGroup>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
      >
        <Textarea
          autoComplete='off'
          placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
          value={description}
          onChange={onChangeDescription}
          maxLength={Number(instance.configuration.getIn(['groups', 'max_characters_description']))}
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
