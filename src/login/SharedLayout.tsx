import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import { HBox, VBox } from '@etsoo/react';
import logo from './../images/etsoo.png';
import { SmartApp } from '../app/SmartApp';

/**
 * Shared layout props
 */
export type SharedLayoutProps = RouteComponentProps & {
  /**
   * Header right part component
   */
  headerRight?: React.ReactNode;

  /**
   * Page right part component
   */
  pageRight?: React.ReactNode;

  /**
   * Naviagating buttons
   */
  buttons?: React.ReactNode;

  /**
   * Main part children
   */
  children?: React.ReactNode;

  /**
   * Bottom components
   */
  bottom?: React.ReactNode;

  /**
   * Title
   */
  title: string;
};

/**
 * Shared layout
 * @param props Props
 * @returns Component
 */
export function SharedLayout(props: SharedLayoutProps) {
  // Destructure
  const { headerRight, pageRight, buttons, children, bottom, title } = props;

  // Culture context
  const Context = SmartApp.cultureState.context;

  return (
    <Box
      sx={{
        position: 'relative',
        padding: 1,
        width: { xs: '100%', sm: 450 },
        marginLeft: 'auto',
        marginRight: 'auto'
      }}
    >
      <HBox
        padding="16px 24px 16px 24px"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Box
          component="img"
          src={logo}
          alt="ETSOO"
          sx={{
            height: { xs: '36px', sm: '48px' },
            userSelect: 'none'
          }}
        />
        {headerRight}
        <Typography variant="subtitle1">
          <Context.Consumer>
            {(value) => value.get('smartERP')}
          </Context.Consumer>
        </Typography>
      </HBox>
      <VBox
        borderRadius={0.5}
        padding={3}
        itemPadding={2}
        boxShadow={1}
        alignItems="flex-start"
        backgroundColor="#f3f3f3"
      >
        <HBox justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{title}</Typography>
          {pageRight}
        </HBox>
        {children}
        <HBox justifyContent="flex-end" itemPadding={2}>
          {buttons}
        </HBox>
      </VBox>
      <HBox padding="8px 24px" itemPadding={2} fontSize="smaller">
        {bottom}
      </HBox>
    </Box>
  );
}
