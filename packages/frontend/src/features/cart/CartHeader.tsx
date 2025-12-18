import React, { useState } from 'react';
import {
  CartItem,
  CoreDispatch,
  EmptyFilterSet,
  selectCurrentModal,
  useCoreDispatch,
  useCoreSelector,
  useFetchUserDetailsQuery,
} from '@gen3/core';
import { filesize } from 'filesize';
import { Button, Loader, Menu, Tooltip } from '@mantine/core';
import { DownloadButton } from '@/components/DownloadButtons';
import { removeFromCart } from './updateCart';
import { focusStyles } from '@/utils';
import { cartAboveLimit } from './utils';
import {
  ArrowDropDownIcon,
  CartIcon,
  DownloadIcon,
  FileIcon,
  PersonIcon,
  SaveIcon,
} from '@/utils/icons';
import { getFormattedTimestamp } from '@/utils/date';
import { ADDITIONAL_DOWNLOAD_MESSAGE } from '@/utils/constants';

const download = (arg: any) => null;

const buttonStyle =
  'bg-base-max text-primary border-primary data-disabled:opacity-50 data-disabled:bg-base-max data-disabled:text-primary hover:bg-base-max hover:text-primary';

const downloadCart = (
  filesByCanAccess: Record<string, CartItem[]>,
  dbGapList: string[],
  setActive: (active: boolean) => void,
  dispatch: CoreDispatch,
) => {
  if (
    cartAboveLimit(filesByCanAccess) ||
    (filesByCanAccess?.false || []).length > 0 ||
    dbGapList.length > 0
  ) {
    //    dispatch(showModal({ modal: Modals.CartDownloadModal }));
    setActive(false);
  } else {
    download({
      endpoint: 'data',
      method: 'POST',
      dispatch,
      params: {
        ids: filesByCanAccess.true.map((file) => file?.file_id),
        annotations: true,
        related_files: true,
      },
      done: () => setActive(false),
    });
  }
};

const downloadManifest = (
  cart: CartItem[],
  setActive: (active: boolean) => void,
  dispatch: CoreDispatch,
) => {
  download({
    endpoint: 'files',
    method: 'POST',
    dispatch,
    params: {
      filters: {
        op: 'in',
        content: {
          field: 'files.file_id',
          value: cart.map((file) => file?.file_id),
        },
      },
      return_type: 'manifest',
      size: 10000,
      filename: `gdc_manifest.${getFormattedTimestamp({
        includeTimes: true,
      })}.txt`,
    },
    done: () => setActive(false),
  });
};

interface CartHeaderProps {
  // summaryData: CartSummaryData;
  summaryData: any;
  cart: CartItem[];
  filesByCanAccess: Record<string, CartItem[]>;
  dbGapList: string[];
}

const CartHeader: React.FC<CartHeaderProps> = ({
  summaryData,
  cart,
  filesByCanAccess,
  dbGapList,
}: CartHeaderProps) => {
  const dispatch = useCoreDispatch();
  const { data: userDetails } = useFetchUserDetailsQuery();
  const [cartDownloadActive, setCartDownloadActive] = useState(false);
  const [manifestDownloadActive, setManifestDownloadActive] = useState(false);
  const [clinicalTSVDownloadActive, setClinicalTSVDownloadActive] =
    useState(false);
  const [clinicalJSONDownloadActive, setClinicalJSONDownloadActive] =
    useState(false);
  const [biospecimenTSVDownloadActive, setBiospecimenTSVDownloadActive] =
    useState(false);
  const [biospecimenJSONDownloadActive, setBiospecimenJSONDownloadActive] =
    useState(false);
  const [metadataDownloadActive, setMetadataDownloadActive] = useState(false);
  const [sampleSheetDownloadActive, setSampleSheetDownloadActive] =
    useState(false);
  const modal = useCoreSelector((state) => selectCurrentModal(state));

  return (
    <>
      {/* ----
      {modal === Modals.CartSizeLimitModal && <CartSizeLimitModal openModal />}
      {modal === Modals.CartDownloadModal && (
        <CartDownloadModal
          openModal
          user={userDetails?.data}
          filesByCanAccess={filesByCanAccess}
          dbGapList={dbGapList}
          setActive={setCartDownloadActive}
        />
      )}
      --- */}
      <div
        className="bg-primary text-primary-contrast-darkest flex flex-col-reverse 2xl:flex-row 2xl:items-center gap-4 w-full p-4"
        data-testid="cart-header"
      >
        <div className="flex flex-wrap gap-2">
          <Menu width="target" closeOnItemClick={false}>
            <Menu.Target>
              <Button
                data-testid="button-download-cart"
                classNames={{
                  root: `${buttonStyle} ${focusStyles}`,
                }}
                leftSection={
                  <DownloadIcon
                    aria-hidden="true"
                    size="1rem"
                    className="hidden xl:block"
                  />
                }
                rightSection={
                  <div className="border-l pl-1 -mr-2">
                    <ArrowDropDownIcon size="1.5em" aria-hidden="true" />
                  </div>
                }
              >
                Download Cart
              </Button>
            </Menu.Target>
            <Menu.Dropdown data-testid="dropdown-menu-options">
              <Tooltip
                label={ADDITIONAL_DOWNLOAD_MESSAGE}
                disabled={!manifestDownloadActive}
              >
                <span>
                  <Menu.Item
                    component={DownloadButton}
                    classNames={{ item: 'font-normal border-0' }}
                    buttonLabel="Manifest"
                    preventClickEvent
                    endpoint="file"
                    setActive={setManifestDownloadActive}
                    active={manifestDownloadActive}
                    format="tsv"
                    variant="white"
                    method="POST"
                    fields={[
                      'file_id',
                      'file_name',
                      'file_size',
                      'md5sum',
                      'cases.case_id',
                    ]}
                    extraParams={{
                      isManifest: true,
                    }}
                    leftSection={
                      manifestDownloadActive ? (
                        <Loader size={15} />
                      ) : (
                        <DownloadIcon aria-hidden="true" />
                      )
                    }
                    caseFilters={EmptyFilterSet}
                    filters={{
                      mode: 'and',
                      root: {
                        file_id: {
                          operator: 'in',
                          field: 'file_id',
                          operands: cart.map((file) => file?.file_id),
                        },
                      },
                    }}
                  ></Menu.Item>
                </span>
              </Tooltip>
              {/* ------ TODO: Add back then Gen3 supports this
              <Tooltip
                label="A previous download is being processed. Additional downloads may be started."
                disabled={!cartDownloadActive}
              >
                <span>
                  <Menu.Item
                    onClick={() => {
                      setCartDownloadActive(true);
                      downloadCart(
                        filesByCanAccess,
                        dbGapList,
                        setCartDownloadActive,
                        dispatch,
                      );
                    }}
                    leftSection={
                      cartDownloadActive ? (
                        <Loader size={15} />
                      ) : (
                        <DownloadIcon aria-hidden="true" />
                      )
                    }
                    disabled={true}
                  >
                    Cart
                  </Menu.Item>
                </span>
              </Tooltip>
              --- */}
            </Menu.Dropdown>
          </Menu>
          {/* Biospecimen */}
          <Menu width="target">
            <Menu.Target>
              <Button
                data-testid="button-download-biospecimen"
                classNames={{
                  root: `${buttonStyle} ${focusStyles}`,
                }}
                leftSection={
                  <DownloadIcon
                    aria-hidden="true"
                    size="1rem"
                    className="hidden xl:block"
                  />
                }
                rightSection={
                  <div className="border-l pl-1 -mr-2">
                    <ArrowDropDownIcon size="1.5em" aria-hidden="true" />
                  </div>
                }
              >
                Biospecimen
              </Button>
            </Menu.Target>
            <Menu.Dropdown data-testid="dropdown-menu-options">
              <Menu.Item
                component={DownloadButton}
                classNames={{ item: 'font-normal border-0' }}
                buttonLabel="JSON"
                preventClickEvent
                endpoint="biospecimen_tar"
                setActive={setBiospecimenJSONDownloadActive}
                active={biospecimenJSONDownloadActive}
                format="json"
                method="POST"
                filename={`biospecimen_cart.${new Date()
                  .toISOString()
                  .slice(0, 10)}.json`}
                fields={[
                  'cases.case_id',
                  'cases.project.project_id',
                  'submitter_id',
                  'cases.samples.tumor_descriptor',
                  'cases.samples.specimen_type',
                  'cases.samples.days_to_sample_procurement',
                  'cases.samples.updated_datetime',
                  'cases.samples.sample_id',
                  'cases.samples.submitter_id',
                  'cases.samples.state',
                  'cases.samples.preservation_method',
                  'cases.samples.sample_type',
                  'cases.samples.tissue_type',
                  'cases.samples.created_datetime',
                  'cases.samples.portions.portion_id',
                  'cases.samples.portions.analytes.analyte_id',
                  'cases.samples.portions.analytes.aliquots.aliquot_id',
                  'cases.samples.portions.analytes.aliquots.updated_datetime',
                  'cases.samples.portions.analytes.aliquots.submitter_id',
                  'cases.samples.portions.analytes.aliquots.state',
                  'cases.samples.portions.analytes.aliquots.created_datetime',
                ]}
                caseFilters={EmptyFilterSet}
                filters={{
                  mode: 'and',
                  root: {
                    file_id: {
                      operator: 'in',
                      field: 'file_id',
                      operands: cart.map((file) => file?.file_id),
                    },
                  },
                }}
              />
              <Menu.Item
                component={DownloadButton}
                classNames={{ item: 'font-normal border-0' }}
                buttonLabel="TSV"
                preventClickEvent
                endpoint="file"
                setActive={setBiospecimenTSVDownloadActive}
                active={biospecimenTSVDownloadActive}
                format="tsv"
                method="POST"
                disabled={true}
                toolTip="TSV download is not available."
              />
            </Menu.Dropdown>
          </Menu>
          {/* Clinical */}
          <Menu width="target">
            <Menu.Target>
              <Button
                data-testid="button-download-clinical"
                classNames={{
                  root: `${buttonStyle} ${focusStyles}`,
                }}
                leftSection={
                  <DownloadIcon
                    aria-hidden="true"
                    size="1rem"
                    className="hidden xl:block"
                  />
                }
                rightSection={
                  <div className="border-l pl-1 -mr-2">
                    <ArrowDropDownIcon size="1.5em" aria-hidden="true" />
                  </div>
                }
              >
                Clinical
              </Button>
            </Menu.Target>
            <Menu.Dropdown data-testid="dropdown-menu-options">
              <Menu.Item
                component={DownloadButton}
                classNames={{ item: 'font-normal border-0' }}
                buttonLabel="JSON"
                preventClickEvent
                endpoint="file"
                setActive={setClinicalJSONDownloadActive}
                active={clinicalJSONDownloadActive}
                format="json"
                method="POST"
                filename={`clinical_cart.${new Date()
                  .toISOString()
                  .slice(0, 10)}.json`}
                caseFilters={EmptyFilterSet}
                fields={[
                  'cases.primary_site',
                  'cases.disease_type',
                  'updated_datetime',
                  'cases.case_id',
                  'cases.follow_ups.follow_up_id',
                  'cases.follow_ups.updated_datetime',
                  'cases.follow_ups.submitter_id',
                  'cases.follow_ups.days_to_follow_up',
                  'cases.follow_ups.state',
                  'cases.follow_ups.created_datetime',
                  'cases.project.project_id',
                  'submitter_id',
                  'cases.index_date',
                  'state',
                  'cases.diagnoses.iss_stage',
                  'cases.diagnoses.morphology',
                  'cases.diagnoses.submitter_id',
                  'cases.diagnoses.created_datetime',
                  'cases.diagnoses.treatments.days_to_treatment_end',
                  'cases.diagnoses.treatments.days_to_treatment_start',
                  'cases.diagnoses.treatments.updated_datetime',
                  'cases.diagnoses.treatments.regimen_or_line_of_therapy',
                  'cases.diagnoses.treatments.submitter_id',
                  'cases.diagnoses.treatments.treatment_id',
                  'cases.diagnoses.treatments.treatment_type',
                  'cases.diagnoses.treatments.state',
                  'cases.diagnoses.treatments.treatment_or_therapy',
                  'cases.diagnoses.treatments.created_datetime',
                  'cases.diagnoses.last_known_disease_status',
                  'cases.diagnoses.tissue_or_organ_of_origin',
                  'cases.diagnoses.days_to_last_follow_up',
                  'cases.diagnoses.age_at_diagnosis',
                  'cases.diagnoses.primary_diagnosis',
                  'cases.diagnoses.updated_datetime',
                  'cases.diagnoses.diagnosis_id',
                  'cases.diagnoses.site_of_resection_or_biopsy',
                  'cases.diagnoses.state',
                  'cases.diagnoses.days_to_last_known_disease_status',
                  'cases.diagnoses.tumor_grade',
                  'cases.diagnoses.progression_or_recurrence',
                  'created_datetime',
                  'cases.demographic.demographic_id',
                  'cases.demographic.ethnicity',
                  'cases.demographic.gender',
                  'cases.demographic.race',
                  'cases.demographic.vital_status',
                  'cases.demographic.updated_datetime',
                  'cases.demographic.age_at_index',
                  'cases.demographic.submitter_id',
                  'cases.demographic.days_to_birth',
                  'cases.demographic.state',
                  'cases.demographic.created_datetime',
                ]}
                filters={{
                  mode: 'and',
                  root: {
                    file_id: {
                      operator: 'in',
                      field: 'file_id',
                      operands: cart.map((file) => file?.file_id),
                    },
                  },
                }}
              />
              <Menu.Item
                component={DownloadButton}
                classNames={{ item: 'font-normal border-0' }}
                buttonLabel="TSV"
                preventClickEvent
                endpoint="clinical_tar"
                setActive={setClinicalTSVDownloadActive}
                active={clinicalTSVDownloadActive}
                format="tsv"
                method="POST"
                disabled={true}
                toolTip="TSV download is not available."
              />
            </Menu.Dropdown>
          </Menu>
          {/* Sample Sheet */}
          <DownloadButton
            buttonLabel="Sample Sheet"
            preventClickEvent
            endpoint="file"
            setActive={setSampleSheetDownloadActive}
            active={sampleSheetDownloadActive}
            format="tsv"
            method="POST"
            filename={`cart_sample_sheet.${new Date()
              .toISOString()
              .slice(0, 10)}.json`}
            fields={[
              'file_id',
              'file_name',
              'data_category',
              'data_type',
              'cases.project.project_id',
              'cases.submitter_id',
              'cases.samples.submitter_id',
              'cases.samples.tissue_type',
              'cases.samples.tumor_descriptor',
              'cases.samples.specimen_type',
              'cases.samples.preservation_method',
            ]}
            caseFilters={EmptyFilterSet}
            filters={{
              mode: 'and',
              root: {
                file_id: {
                  operator: 'in',
                  field: 'file_id',
                  operands: cart.map((file) => file?.file_id),
                },
              },
            }}
          />
          {/* Metadata */}
          <DownloadButton
            preventClickEvent
            endpoint="file"
            setActive={setMetadataDownloadActive}
            active={metadataDownloadActive}
            buttonLabel="Download Metadata"
            format="json"
            method="POST"
            filename={`metadata.cart.${new Date()
              .toISOString()
              .slice(0, 10)}.json`}
            fields={[
              'state',
              'access',
              'md5sum',
              'data_format',
              'data_type',
              'data_category',
              'file_name',
              'file_size',
              'file_id',
              'platform',
              'experimental_strategy',
              'center.short_name',
              'annotations.annotation_id',
              'annotations.entity_id',
              'tags',
              'submitter_id',
              'archive.archive_id',
              'archive.submitter_id',
              'archive.revision',
              'associated_entities.entity_id',
              'associated_entities.entity_type',
              'associated_entities.case_id',
              'analysis.analysis_id',
              'analysis.workflow_type',
              'analysis.updated_datetime',
              'analysis.input_files.file_id',
              'analysis.metadata.read_groups.read_group_id',
              'analysis.metadata.read_groups.is_paired_end',
              'analysis.metadata.read_groups.read_length',
              'analysis.metadata.read_groups.library_name',
              'analysis.metadata.read_groups.sequencing_center',
              'analysis.metadata.read_groups.sequencing_date',
              'downstream_analyses.output_files.access',
              'downstream_analyses.output_files.file_id',
              'downstream_analyses.output_files.file_name',
              'downstream_analyses.output_files.data_category',
              'downstream_analyses.output_files.data_type',
              'downstream_analyses.output_files.data_format',
              'downstream_analyses.workflow_type',
              'downstream_analyses.output_files.file_size',
              'index_files.file_id',
            ]}
            caseFilters={EmptyFilterSet}
            filters={{
              mode: 'and',
              root: {
                file_id: {
                  operator: 'in',
                  field: 'file_id',
                  operands: cart.map((file) => file?.file_id),
                },
              },
            }}
          />
          {/* Remove From Cart */}
          <Menu>
            <Menu.Target>
              <Button
                data-testid="button-remove-from-cart"
                leftSection={
                  <CartIcon
                    aria-hidden="true"
                    size="1rem"
                    className="hidden xl:block"
                  />
                }
                rightSection={
                  <div className="border-l pl-1 -mr-2">
                    <ArrowDropDownIcon size="1.5em" aria-hidden="true" />
                  </div>
                }
                classNames={{
                  root: `bg-white text-primary hover:bg-removeButtonHover ${focusStyles}`,
                }}
              >
                Remove From Cart
              </Button>
            </Menu.Target>
            <Menu.Dropdown data-testid="dropdown-menu-options">
              <Menu.Item onClick={() => removeFromCart(cart, cart, dispatch)}>
                All Files ({cart.length})
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  removeFromCart(filesByCanAccess?.false || [], cart, dispatch)
                }
              >
                Unauthorized Files ({(filesByCanAccess?.false || []).length})
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <h1 className="uppercase flex 2xl:ml-auto items-center truncate text-xl">
          Total of{' '}
          <FileIcon size={25} className="ml-2 mr-1" aria-hidden="true" />{' '}
          <b data-testid="text-file-count" className="mr-1">
            {summaryData?.total_doc_count?.toLocaleString() || '--'}
          </b>{' '}
          {summaryData?.total_doc_count === 1 ? 'File' : 'Files'}
          <PersonIcon size={25} className="ml-2 mr-1" aria-hidden="true" />{' '}
          <b data-testid="text-case-count" className="mr-1">
            {summaryData?.total_case_count?.toLocaleString() || '--'}
          </b>{' '}
          {summaryData?.total_case_count === 1 ? 'Case' : 'Cases'}{' '}
          <SaveIcon size={25} className="ml-2 mr-1" aria-hidden="true" />{' '}
          <span data-testid="text-size-count">
            {filesize(summaryData?.total_file_size || 0)}
          </span>{' '}
        </h1>
      </div>
    </>
  );
};

export default CartHeader;
