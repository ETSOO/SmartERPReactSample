import { IdLabelDto } from '@etsoo/appscript';
import {
  DialogButton,
  MUGlobal,
  SearchField,
  SelectEx,
  Tiplist,
  ScrollerListForwardRef,
  ResponsivePage,
  GridDataType,
  GridCellRendererProps
} from '@etsoo/react';
import { DateUtils } from '@etsoo/shared';
import {
  Box,
  BoxProps,
  Card,
  CardContent,
  LinearProgress,
  Typography
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
import { SmartApp } from '../../app/SmartApp';
import { LoginHistoryDto } from '../../models/LoginHistoryDto';

// Multiple states
interface States {
  startDate?: Date | null;
}

function LoginHistory(props: RouteComponentProps) {
  // App
  const app = SmartApp.instance;

  // Refs
  const ref = React.createRef<ScrollerListForwardRef>();

  // Load data
  const reloadData = async () => {
    ref.current?.reset();
  };

  // States
  const [states, stateUpdate] = React.useReducer(
    (state: States, newState: Partial<States>) => {
      return { ...state, ...newState };
    },
    {}
  );

  const margin = MUGlobal.pagePaddings;

  React.useEffect(() => {
    // Page title
    app.setPageTitle(app.get('menuLoginHistory')!);
  }, [app]);

  return (
    <React.Fragment>
      <ResponsivePage<LoginHistoryDto>
        mRef={ref}
        defaultOrderBy="creation"
        pageProps={{ onRefresh: reloadData }}
        fields={[
          <Tiplist<IdLabelDto>
            label={app.get('device')!}
            name="deviceId"
            search
            loadData={async (keyword, id) => {
              return await app.api.post<IdLabelDto[]>(
                'User/DeviceList',
                {
                  id,
                  keyword
                },
                { defaultValue: [], showLoading: false }
              );
            }}
          />,
          <SelectEx<IdLabelDto>
            label={app.get('successLogin')!}
            name="success"
            search
            options={[
              { id: 'false', label: app.get('no')! },
              { id: 'true', label: app.get('yes')! }
            ]}
          />,
          <SearchField
            label={app.get('startDate')!}
            name="creationStart"
            type="date"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              stateUpdate({ startDate: event.currentTarget.valueAsDate })
            }
            inputProps={{ max: DateUtils.formatForInput() }}
          />,
          <SearchField
            label={app.get('endDate')!}
            name="creationEnd"
            type="date"
            inputProps={{
              min:
                states.startDate == null
                  ? undefined
                  : DateUtils.formatForInput(states.startDate),
              max: DateUtils.formatForInput()
            }}
          />
        ]}
        itemSize={150}
        loadData={async (data) => {
          // Format data
          data.success = data.success == null ? null : data.success === 'true';

          return await app.api.post<LoginHistoryDto[]>(
            'User/LoginHistory',
            data,
            { defaultValue: [], showLoading: false }
          );
        }}
        columns={[
          {
            field: 'creation',
            type: GridDataType.DateTime,
            width: 164,
            header: app.get('creation'),
            sortable: true,
            sortAsc: false
          },
          { field: 'deviceName', header: app.get('device') },
          {
            field: 'language',
            width: 90,
            header: app.get('language'),
            sortable: true
          },
          {
            field: 'success',
            width: 90,
            type: GridDataType.Boolean,
            header: app.get('success'),
            sortable: false
          },
          {
            field: 'reason',
            width: 150,
            header: app.get('description')
          },
          {
            width: 80,
            header: app.get('actions'),
            align: 'center',
            cellRenderer: ({
              data,
              cellProps
            }: GridCellRendererProps<LoginHistoryDto, BoxProps>) => {
              if (data == null) return undefined;

              cellProps.sx = {
                paddingTop: '9px!important',
                paddingBottom: '9px!important'
              };

              return (
                <DialogButton
                  content={JSON.stringify(data, undefined, 2)}
                  contentPre
                  disableScrollLock
                  maxWidth="xs"
                  size="small"
                  icon={<InfoIcon />}
                >
                  JSON data
                </DialogButton>
              );
            }
          }
        ]}
        innerItemRenderer={({ data }) => {
          return data == null ? (
            <LinearProgress />
          ) : (
            <Card
              sx={{
                marginBottom: margin,
                marginLeft: margin,
                marginRight: margin
              }}
            >
              <CardContent>
                <Typography variant="body2" noWrap>
                  {data.deviceName}
                </Typography>

                <Typography variant="caption" noWrap>
                  {[data.country, data.language, data.timezone].join(', ')}
                </Typography>

                <Typography
                  variant="body2"
                  noWrap
                  color={data.success ? 'green' : 'red'}
                >
                  {data.success ? 'Success' : 'Failed: ' + data.reason}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="caption" noWrap>
                    {app.formatDate(data.creation, 'ds')}
                  </Typography>
                  <DialogButton
                    content={JSON.stringify(data, undefined, 2)}
                    contentPre
                    disableScrollLock
                    maxWidth="xs"
                    size="small"
                  >
                    JSON data
                  </DialogButton>
                </Box>
              </CardContent>
            </Card>
          );
        }}
      />
    </React.Fragment>
  );
}

export default LoginHistory;
