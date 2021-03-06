'use strict';

import React from 'react';
import agent from 'superagent';

export default React.createClass({
    getInitialState() {
        return {
        };
    },
    getDetails() {
        agent
            .get(`repo/${this.props.repo.owner}/${this.props.repo.name}?action=status&details=true`)
            .end((err, res) => {
                var body = res.body;
                this.setState(body);
            });
    },
    switchEnable() {
        this.lock();
        agent
            .get(`repo/${this.props.repo.owner}/${this.props.repo.name}?action=enable`)
            .end((err, res) => {
                var result;
                if (res.status === 200) {
                    result = res.body;
                } else {
                    result = {
                        error: 'Enable failed'
                    };
                }
                result.locked = false;
                this.setState(result);
            });
    },
    release(inc) {
        var confirm = window.confirm(`Bump ${this.props.repo.name} to the next ${inc}?`);
        if (confirm) {
            this.lock();
            agent
                .get(`repo/${this.props.repo.owner}/${this.props.repo.name}?action=publish&bump=${inc}`)
                .end((err, res) => {
                    var result;
                    if (res.status === 200) {
                        result = res.body;
                    } else {
                        result = {
                            error:`Error during release process`,
                            errorValue: res.text
                        };
                    }
                    result.locked = false;
                    this.setState(result);
                });
        }
    },
    buildHead() {
        this.lock();
        agent
            .get(`repo/${this.props.repo.owner}/${this.props.repo.name}?action=head`)
            .end((err, res) => {
                var result = {
                    locked: false
                };
                if (res.status !== 200) {
                    result.error = `Error during HEAD build`;
                    result.errorValue = res.text
                }
                this.setState(result);
            });
    },
    npmPublish() {
        this.lock();
        agent
            .get(`repo/${this.props.repo.owner}/${this.props.repo.name}?action=npm`)
            .end((err, res) => {
                var result = {
                    locked: false
                };
                if (res.status !== 200) {
                    result.error = 'Error during npm publish';
                    result.errorValue = res.text;
                }
                this.setState(result);
            });
    },
    lock() {
        this.setState({
            locked: true,
            error: false,
            errorValue: false
        });
    },
    render() {
        var active = this.props.repo.active;
        if (!this.props.visible && !active) {
            return (<tr ></tr>);
        }

        var checked = active ? 'checked' : null;
        var locked = this.state.locked;
        if (active) {
            var hasVersion = !!this.state.version;
            var version = this.state.version || '?';
            var name = this.props.repo.name;
            var owner = this.props.repo.owner;
            return (
                <tr>
                    <td>
                        <input type="checkbox" checked={checked} disabled={locked}
                               onChange={this.switchEnable}/>
                    </td>
                    <td>
                        {name}
                    </td>
                    <td>
                        <strong title={this.state.desc || ''}>v{version}</strong>
                    </td>
                    <td>
                        <input type="button" value="patch"
                               onClick={() => this.release('patch')} disabled={locked} />
                        <input type="button" value="minor"
                               onClick={() => this.release('minor')} disabled={locked} />
                        <input type="button" value="major"
                               onClick={() => this.release('major')} disabled={locked} />
                        &nbsp;<input type="button" value="HEAD"
                                     onClick={this.buildHead} disabled={locked} />
                        &nbsp;<input type="button" value="NPM"
                               onClick={this.npmPublish} disabled={locked} />
                    </td>
                    {
                        hasVersion ? (
                            <td>
                                <a href={`https://www.npmjs.com/package/${this.state.npm || ''}`}>
                                    <img src={`https://img.shields.io/npm/v/${this.state.npm || ''}.svg?style=flat-square`} alt="npm package status" />
                                </a>
                            </td>
                        ) : ''
                    }
                    {
                        hasVersion ? (
                            <td>
                                <a href={`https://travis-ci.org/${owner}/${name}`}>
                                    <img src={`https://img.shields.io/travis/${owner}/${name}/master.svg?style=flat-square`} alt="build status" />
                                </a>
                            </td>
                        ) : ''
                    }
                    <td>
                        <input type="button" value="details"
                               onClick={this.getDetails} disabled={locked} />
                    </td>
                    <td>
                        {this.state.error ? <span title={this.state.errorValue}>{this.state.error}</span> : ''}
                    </td>
                </tr>
            );
        } else {
            return (
                <tr>
                    <td>
                        <input type="checkbox" checked={checked} disabled={locked}
                               onChange={this.switchEnable}/>
                    </td>
                    <td>
                        {this.props.repo.name}
                    </td>
                </tr>
            );
        }
    }
});
